// input.js — pointer and keyboard input for the game canvas.
// Pointer clicks are converted from page pixels to the game's fixed
// 1280x720 coordinate space; keys are the keyboard way to play.

export const GAME_W = 1280;
export const GAME_H = 720;

/** Convert a pointer event on the canvas to game coordinates. */
export function pointerToGame(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * GAME_W;
  const y = ((event.clientY - rect.top) / rect.height) * GAME_H;
  return { x, y };
}

/**
 * Wire the canvas and the keyboard to the game. `handlers` receives:
 * click(point) for a pointer press, and key(action) for named keys
 * ('start', 'hint', 'mute', 'restart', 'next').
 */
export function bindInput(canvas, handlers) {
  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    handlers.click(pointerToGame(canvas, event));
  });
  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'enter' || key === ' ') {
      handlers.key('start');
      event.preventDefault();
    } else if (key === 'h') {
      handlers.key('hint');
    } else if (key === 'm') {
      handlers.key('mute');
    } else if (key === 'r') {
      handlers.key('restart');
    } else if (key === 'n') {
      handlers.key('next');
    }
  });
}
