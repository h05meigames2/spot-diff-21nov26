// game.js — the state machine of "Pasar Malam": title, play, scene-clear,
// win and loss, with timer, score, hints, wrong-click penalty and restart.
// Rendering lives in render.js; scene art lives in scene.js.

import { SCENES } from './scene.js';
import { findDifferenceAt, sceneComplete } from './differences.js';
import { SoundEngine } from './audio.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_SCENE_CLEAR = 'scene-clear';
export const SCREEN_WIN = 'win';
export const SCREEN_LOSE = 'lose';

export const POINTS_PER_FIND = 100;
export const TIME_BONUS_PER_SECOND = 10;
export const WRONG_CLICK_PENALTY_SECONDS = 5;
export const HINTS_PER_SCENE = 3;
export const HINT_SHOW_MS = 2200;

/** A fresh game state. */
export function createGame() {
  return {
    screen: SCREEN_TITLE,
    sceneIndex: 0,
    found: new Set(),
    score: 0,
    timeLeft: SCENES[0].seconds,
    hintsLeft: HINTS_PER_SCENE,
    hint: null, // {diff, until} while a hint pulse is showing
    wrongClicks: 0,
    findsThisScene: 0,
    totalFinds: 0,
    scenesCleared: 0,
    lastGain: 0, // points of the latest find, shown as a floater
    lastGainAt: 0,
    flash: null, // {x, y, good, until} click feedback ring
    shakeUntil: 0,
    sound: new SoundEngine(),
    startedAt: 0,
    finishedAt: 0,
  };
}

/** The timer as M:SS for the HUD. */
export function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Total differences across all scenes (7 + 8 + 10). */
export function totalDifferences() {
  return SCENES.reduce((n, scene) => n + scene.diffs.length, 0);
}

/** The scene currently being played. */
export function currentScene(game) {
  return SCENES[game.sceneIndex];
}

/** Start (or restart) the whole game from scene 1. */
export function startGame(game) {
  game.screen = SCREEN_PLAY;
  game.sceneIndex = 0;
  game.found = new Set();
  game.score = 0;
  game.timeLeft = SCENES[0].seconds;
  game.hintsLeft = HINTS_PER_SCENE;
  game.hint = null;
  game.wrongClicks = 0;
  game.findsThisScene = 0;
  game.totalFinds = 0;
  game.scenesCleared = 0;
  game.lastGain = 0;
  game.flash = null;
  game.startedAt = performance.now();
  game.finishedAt = 0;
  game.sound.ensure();
  game.sound.click();
}

/** Move on to the next scene, or to the win screen after the last one. */
export function nextScene(game) {
  game.scenesCleared += 1;
  if (game.sceneIndex + 1 >= SCENES.length) {
    game.screen = SCREEN_WIN;
    game.finishedAt = performance.now();
    game.sound.win();
    return;
  }
  game.sceneIndex += 1;
  game.found = new Set();
  game.timeLeft = SCENES[game.sceneIndex].seconds;
  game.hintsLeft = HINTS_PER_SCENE;
  game.hint = null;
  game.findsThisScene = 0;
  game.screen = SCREEN_PLAY;
  game.sound.sceneClear();
}

/** The timer ticks only while playing; hitting zero loses the game. */
export function tick(game, dtSeconds, now) {
  if (game.screen !== SCREEN_PLAY) return;
  game.timeLeft -= dtSeconds;
  if (game.hint && now > game.hint.until) game.hint = null;
  if (game.flash && now > game.flash.until) game.flash = null;
  if (game.timeLeft <= 0) {
    game.timeLeft = 0;
    game.screen = SCREEN_LOSE;
    game.finishedAt = now;
    game.sound.lose();
  }
}

/** Handle a click in game coordinates; the panel layout comes from render.js. */
export function handleClick(game, point, panels, now) {
  if (game.screen === SCREEN_TITLE) {
    startGame(game);
    return;
  }
  if (game.screen === SCREEN_SCENE_CLEAR) {
    nextScene(game);
    return;
  }
  if (game.screen === SCREEN_WIN || game.screen === SCREEN_LOSE) {
    startGame(game);
    return;
  }
  if (game.screen !== SCREEN_PLAY) return;
  // Which panel was clicked, and where inside it?
  let panel = null;
  for (const p of panels) {
    if (point.x >= p.x && point.x <= p.x + p.w && point.y >= p.y && point.y <= p.y + p.h) {
      panel = p;
      break;
    }
  }
  if (!panel) return;
  const scene = currentScene(game);
  const diff = findDifferenceAt(scene, game.found, point.x - panel.x, point.y - panel.y);
  if (diff) {
    game.found.add(diff.id);
    game.findsThisScene += 1;
    game.totalFinds += 1;
    const gain = POINTS_PER_FIND + Math.max(0, Math.floor(game.timeLeft)) * 2;
    game.score += gain;
    game.lastGain = gain;
    game.lastGainAt = now;
    game.flash = { x: point.x, y: point.y, good: true, until: now + 450 };
    game.sound.found();
    if (sceneComplete(scene, game.found)) {
      game.score += Math.floor(game.timeLeft) * TIME_BONUS_PER_SECOND;
      game.screen = SCREEN_SCENE_CLEAR;
      game.sound.sceneClear();
    }
  } else {
    game.wrongClicks += 1;
    game.timeLeft = Math.max(0, game.timeLeft - WRONG_CLICK_PENALTY_SECONDS);
    game.flash = { x: point.x, y: point.y, good: false, until: now + 450 };
    game.shakeUntil = now + 220;
    game.sound.wrong();
    if (game.timeLeft <= 0) {
      game.screen = SCREEN_LOSE;
      game.finishedAt = now;
      game.sound.lose();
    }
  }
}

/** Spend one hint: briefly pulse a random unfound difference. */
export function useHint(game, now) {
  if (game.screen !== SCREEN_PLAY) return false;
  if (game.hintsLeft <= 0) return false;
  const scene = currentScene(game);
  const remaining = scene.diffs.filter((d) => !game.found.has(d.id));
  if (remaining.length === 0) return false;
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  game.hintsLeft -= 1;
  game.hint = { diff: pick, until: now + HINT_SHOW_MS };
  game.sound.hint();
  return true;
}

/** Keyboard actions, by name (see input.js). */
export function handleKey(game, action, now) {
  if (action === 'start') {
    if (game.screen === SCREEN_TITLE) startGame(game);
    else if (game.screen === SCREEN_SCENE_CLEAR) nextScene(game);
    else if (game.screen === SCREEN_WIN || game.screen === SCREEN_LOSE) startGame(game);
  } else if (action === 'hint') {
    useHint(game, now);
  } else if (action === 'mute') {
    game.sound.muted = !game.sound.muted;
  } else if (action === 'restart') {
    startGame(game);
  } else if (action === 'next') {
    if (game.screen === SCREEN_SCENE_CLEAR) nextScene(game);
  }
}
