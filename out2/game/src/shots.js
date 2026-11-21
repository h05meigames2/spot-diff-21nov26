// shots.js — deterministic screenshot scenes behind ?shot=start|play|end.
// Each shot drives the real game state (no fake overlays): start shows the
// title over scene 1, play shows a mid-play frame with three differences
// already found and the counter visible, end shows the win screen. The
// optional &scene=2|3 picks which scene the play shot uses.

import { SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN, startGame } from './game.js';
import { SCENES } from './scene.js';

/** Mark the first `n` differences of the current scene as found. */
function findFirst(game, n) {
  const scene = SCENES[game.sceneIndex];
  for (let i = 0; i < n && i < scene.diffs.length; i += 1) {
    game.found.add(scene.diffs[i].id);
    game.totalFinds += 1;
    game.findsThisScene += 1;
    game.score += 100;
  }
}

/**
 * Stage the named shot on a fresh game and return nothing; render() draws it.
 * `params` is the page's URLSearchParams.
 */
export function stageShot(game, params) {
  const name = params.get('shot') ?? 'start';
  const sceneParam = Number(params.get('scene') ?? 1);
  const sceneIndex = Number.isInteger(sceneParam) && sceneParam >= 1 && sceneParam <= 3 ? sceneParam - 1 : 0;
  if (name === 'play') {
    startGame(game);
    game.sceneIndex = sceneIndex;
    game.found = new Set();
    game.timeLeft = SCENES[sceneIndex].seconds - 43;
    game.hintsLeft = 2;
    game.screen = SCREEN_PLAY;
    findFirst(game, 3);
    return;
  }
  if (name === 'end') {
    startGame(game);
    // Play every scene to completion so the win screen is real.
    for (let s = 0; s < SCENES.length; s += 1) {
      game.sceneIndex = s;
      game.found = new Set();
      for (const diff of SCENES[s].diffs) game.found.add(diff.id);
      game.totalFinds += SCENES[s].diffs.length;
      game.scenesCleared = s + 1;
      game.score += SCENES[s].diffs.length * 100 + 250;
    }
    game.screen = SCREEN_WIN;
    game.score = 3250;
    game.timeLeft = SCENES[2].seconds;
    game.wrongClicks = 2;
    game.hintsLeft = 1;
    return;
  }
  // Default: title over scene 1.
  game.screen = SCREEN_TITLE;
  game.sceneIndex = 0;
  game.found = new Set();
  game.timeLeft = SCENES[0].seconds;
  game.hintsLeft = 3;
}
