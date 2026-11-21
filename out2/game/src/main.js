// main.js — entry point: canvas setup, the game loop, input wiring and the
// ?shot= screenshot hook. No network, no assets: everything is drawn by code.

import { createGame, tick, handleClick, handleKey } from './game.js';
import { render, PANELS } from './render.js';
import { bindInput } from './input.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const game = createGame();
// Test hook (also lets a player inspect state from the console).
window.__game = game;
const params = new URLSearchParams(window.location.search);

if (params.has('shot')) {
  stageShot(game, params);
} else {
  game.screen = 'title';
}

bindInput(canvas, {
  click: (point) => handleClick(game, point, PANELS, performance.now()),
  key: (action) => handleKey(game, action, performance.now()),
});

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  tick(game, dt, now);
  render(ctx, game, now);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
