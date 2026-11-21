// render.js — draws the whole game on one 1280x720 canvas: HUD, the two
// scene panels, found markers, hint pulse, click feedback and the overlays
// for title, scene-clear, win and loss.

import { PANEL_W, PANEL_H, SCENES } from './scene.js';
import {
  SCREEN_TITLE, SCREEN_PLAY, SCREEN_SCENE_CLEAR, SCREEN_WIN, SCREEN_LOSE,
  formatTime, totalDifferences,
} from './game.js';

export const PANELS = [
  { x: 40, y: 118, w: PANEL_W, h: PANEL_H },
  { x: 680, y: 118, w: PANEL_W, h: PANEL_H },
];

/** A rounded rectangle path. */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** A green ring + check mark over a found difference, on one panel. */
function drawFoundMarker(ctx, panel, diff, now) {
  const x = panel.x + diff.x;
  const y = panel.y + diff.y;
  const pulse = 1 + Math.sin(now / 180) * 0.05;
  const r = diff.r * pulse;
  ctx.save();
  ctx.strokeStyle = '#2fd47a';
  ctx.lineWidth = 4;
  ctx.shadowColor = 'rgba(47,212,122,0.8)';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.45, y);
  ctx.lineTo(x - r * 0.1, y + r * 0.35);
  ctx.lineTo(x + r * 0.5, y - r * 0.35);
  ctx.stroke();
}

/** The pulsing hint ring over one unfound difference, on both panels. */
function drawHintPulse(ctx, panel, diff, now) {
  const x = panel.x + diff.x;
  const y = panel.y + diff.y;
  const r = diff.r + 6 + Math.sin(now / 150) * 4;
  ctx.save();
  ctx.strokeStyle = '#ffd23f';
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/** The two panels: left is the original, right carries the differences. */
function drawPanels(ctx, game, now) {
  const scene = SCENES[game.sceneIndex];
  const shake = now < game.shakeUntil ? (Math.random() - 0.5) * 8 : 0;
  PANELS.forEach((panel, i) => {
    ctx.save();
    ctx.translate(shake, 0);
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#0d0d1a';
    roundRect(ctx, panel.x - 4, panel.y - 4, panel.w + 8, panel.h + 8, 14);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.rect(panel.x, panel.y, panel.w, panel.h);
    ctx.clip();
    ctx.translate(panel.x, panel.y);
    scene.draw(ctx, i === 1);
    ctx.restore();
    // Panel labels.
    ctx.fillStyle = i === 0 ? '#7ee081' : '#ffb703';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(i === 0 ? 'GAMBAR A' : 'GAMBAR B', panel.x + 6, panel.y - 12);
    // Found markers on both panels.
    for (const diff of scene.diffs) {
      if (game.found.has(diff.id)) drawFoundMarker(ctx, panel, diff, now);
    }
    // Hint pulse on both panels.
    if (game.hint) drawHintPulse(ctx, panel, game.hint.diff, now);
  });
}

/** The top HUD: scene, remaining counter, timer bar, score, hints, mute. */
function drawHud(ctx, game) {
  const scene = SCENES[game.sceneIndex];
  const remaining = scene.diffs.length - game.found.size;
  ctx.fillStyle = '#14142a';
  ctx.fillRect(0, 0, 1280, 78);
  ctx.fillStyle = '#ffd23f';
  ctx.font = 'bold 30px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('PASAR MALAM', 40, 48);
  ctx.fillStyle = '#b9b9d6';
  ctx.font = '20px system-ui, sans-serif';
  ctx.fillText('Cari Perbedaannya', 300, 47);
  // Scene pill.
  ctx.fillStyle = '#2a2a4d';
  roundRect(ctx, 520, 18, 240, 42, 21);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 19px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Scene ${game.sceneIndex + 1}/3 · ${scene.name}`, 640, 46);
  // Remaining counter.
  ctx.fillStyle = remaining === 0 ? '#2fd47a' : '#ff5d5d';
  roundRect(ctx, 790, 18, 150, 42, 21);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillText(`Sisa: ${remaining}`, 865, 46);
  // Timer.
  const low = game.timeLeft <= 15;
  ctx.fillStyle = low ? '#ff5d5d' : '#ffffff';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`⏱ ${formatTime(game.timeLeft)}`, 1085, 48);
  const barW = 150;
  const frac = Math.max(0, game.timeLeft / scene.seconds);
  ctx.fillStyle = '#2a2a4d';
  roundRect(ctx, 1100, 26, barW, 14, 7);
  ctx.fill();
  ctx.fillStyle = low ? '#ff5d5d' : '#2fd47a';
  roundRect(ctx, 1100, 26, barW * frac, 14, 7);
  ctx.fill();
  ctx.textAlign = 'left';
}

/** The bottom bar: score, hints, mute state and the controls. */
function drawFooter(ctx, game) {
  ctx.fillStyle = '#14142a';
  ctx.fillRect(0, 566, 1280, 154);
  ctx.fillStyle = '#ffd23f';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Skor: ${game.score}`, 40, 616);
  ctx.fillStyle = '#b9b9d6';
  ctx.font = '20px system-ui, sans-serif';
  ctx.fillText(`Ditemukan: ${game.totalFinds}/${totalDifferences()}   ·   Klik salah: ${game.wrongClicks} (−5 dtk)`, 40, 652);
  // Hint button state.
  ctx.fillStyle = game.hintsLeft > 0 ? '#2a2a4d' : '#1c1c30';
  roundRect(ctx, 560, 586, 190, 44, 12);
  ctx.fill();
  ctx.fillStyle = game.hintsLeft > 0 ? '#ffd23f' : '#666680';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`💡 Hint (H): ${game.hintsLeft}`, 655, 615);
  // Mute state.
  ctx.fillStyle = '#2a2a4d';
  roundRect(ctx, 770, 586, 190, 44, 12);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillText(game.sound.muted ? '🔇 Suara: Mati (M)' : '🔊 Suara: Hidup (M)', 865, 615);
  // Restart.
  ctx.fillStyle = '#2a2a4d';
  roundRect(ctx, 980, 586, 220, 44, 12);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillText('↻ Ulangi (R)', 1090, 615);
  ctx.fillStyle = '#8a8aa8';
  ctx.font = '17px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Klik perbedaan di GAMBAR A atau B — perbedaan yang sama ada di kedua gambar.', 640, 692);
  ctx.textAlign = 'left';
}

/** A dim veil over the play field for overlays. */
function veil(ctx, alpha) {
  ctx.fillStyle = `rgba(8,8,20,${alpha})`;
  ctx.fillRect(0, 0, 1280, 720);
}

/** A centred card for overlay screens. */
function card(ctx, x, y, w, h) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 24;
  ctx.fillStyle = '#1d1d38';
  roundRect(ctx, x, y, w, h, 18);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#ffd23f';
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 18);
  ctx.stroke();
}

/** The title screen: big name, how to play, three scenes, start prompt. */
function drawTitle(ctx, game, now) {
  drawPanels(ctx, game, now);
  veil(ctx, 0.62);
  card(ctx, 290, 110, 700, 470);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd23f';
  ctx.font = 'bold 58px system-ui, sans-serif';
  ctx.fillText('PASAR MALAM', 640, 200);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px system-ui, sans-serif';
  ctx.fillText('Cari Perbedaannya', 640, 246);
  ctx.fillStyle = '#b9b9d6';
  ctx.font = '21px system-ui, sans-serif';
  ctx.fillText('Dua gambar nyaris sama — temukan semua perbedaannya', 640, 292);
  ctx.fillText('sebelum waktu habis. Klik salah −5 detik!', 640, 322);
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px system-ui, sans-serif';
  ctx.fillText('🌙 Pasar Malam — 7 perbedaan · 90 dtk', 640, 372);
  ctx.fillText('🪸 Terumbu Karang — 8 perbedaan · 75 dtk', 640, 402);
  ctx.fillText('🚀 Stasiun Antariksa — 10 perbedaan · 60 dtk', 640, 432);
  const blink = 0.65 + Math.sin(now / 300) * 0.35;
  ctx.save();
  ctx.globalAlpha = blink;
  ctx.fillStyle = '#2fd47a';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.fillText('▶  KLIK atau tekan ENTER untuk mulai', 640, 500);
  ctx.restore();
  ctx.fillStyle = '#8a8aa8';
  ctx.font = '17px system-ui, sans-serif';
  ctx.fillText('H = hint · M = suara · R = ulangi', 640, 544);
  ctx.textAlign = 'left';
}

/** The scene-clear card: bonus earned, prompt to continue. */
function drawSceneClear(ctx, game) {
  const scene = SCENES[game.sceneIndex];
  veil(ctx, 0.55);
  card(ctx, 390, 220, 500, 260);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#2fd47a';
  ctx.font = 'bold 40px system-ui, sans-serif';
  ctx.fillText('Scene Selesai! 🎉', 640, 300);
  ctx.fillStyle = '#ffffff';
  ctx.font = '22px system-ui, sans-serif';
  ctx.fillText(`${scene.name}: ${scene.diffs.length}/${scene.diffs.length} perbedaan ditemukan`, 640, 348);
  ctx.fillStyle = '#ffd23f';
  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.fillText(`Skor: ${game.score}`, 640, 392);
  ctx.fillStyle = '#b9b9d6';
  ctx.font = '20px system-ui, sans-serif';
  const next = game.sceneIndex + 1 < SCENES.length ? SCENES[game.sceneIndex + 1].name : 'Hasil Akhir';
  ctx.fillText(`Berikutnya: ${next} — klik untuk lanjut`, 640, 432);
  ctx.textAlign = 'left';
}

/** The win screen: final results and Play again. */
function drawWin(ctx, game) {
  veil(ctx, 0.6);
  card(ctx, 340, 130, 600, 440);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd23f';
  ctx.font = 'bold 46px system-ui, sans-serif';
  ctx.fillText('🏆 KAMU MENANG!', 640, 220);
  ctx.fillStyle = '#ffffff';
  ctx.font = '22px system-ui, sans-serif';
  ctx.fillText('Semua 25 perbedaan ditemukan di 3 scene!', 640, 268);
  ctx.fillStyle = '#2fd47a';
  ctx.font = 'bold 34px system-ui, sans-serif';
  ctx.fillText(`Skor Akhir: ${game.score}`, 640, 322);
  ctx.fillStyle = '#b9b9d6';
  ctx.font = '20px system-ui, sans-serif';
  ctx.fillText(`Klik salah: ${game.wrongClicks}   ·   Hint tersisa: ${game.hintsLeft}`, 640, 366);
  ctx.fillText('Pasar Malam ✓  ·  Terumbu Karang ✓  ·  Stasiun Antariksa ✓', 640, 398);
  const blink = 0.65 + Math.sin(performance.now() / 300) * 0.35;
  ctx.save();
  ctx.globalAlpha = blink;
  ctx.fillStyle = '#2fd47a';
  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.fillText('▶  Main lagi — klik atau tekan ENTER', 640, 470);
  ctx.restore();
  ctx.fillStyle = '#8a8aa8';
  ctx.font = '17px system-ui, sans-serif';
  ctx.fillText('Terima kasih sudah bermain!', 640, 522);
  ctx.textAlign = 'left';
}

/** The loss screen: time ran out, score kept, restart prompt. */
function drawLose(ctx, game) {
  const scene = SCENES[game.sceneIndex];
  veil(ctx, 0.6);
  card(ctx, 340, 160, 600, 380);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff5d5d';
  ctx.font = 'bold 44px system-ui, sans-serif';
  ctx.fillText('⏰ Waktu Habis!', 640, 248);
  ctx.fillStyle = '#ffffff';
  ctx.font = '22px system-ui, sans-serif';
  ctx.fillText(`${scene.name}: ${game.found.size}/${scene.diffs.length} perbedaan ditemukan`, 640, 296);
  ctx.fillStyle = '#ffd23f';
  ctx.font = 'bold 30px system-ui, sans-serif';
  ctx.fillText(`Skor: ${game.score}`, 640, 344);
  ctx.fillStyle = '#b9b9d6';
  ctx.font = '20px system-ui, sans-serif';
  ctx.fillText('Perbedaan yang belum ketemu masih menunggu…', 640, 388);
  const blink = 0.65 + Math.sin(performance.now() / 300) * 0.35;
  ctx.save();
  ctx.globalAlpha = blink;
  ctx.fillStyle = '#2fd47a';
  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.fillText('↻  Coba lagi — klik atau tekan ENTER', 640, 448);
  ctx.restore();
  ctx.textAlign = 'left';
}

/** Click feedback: a green ring on a find, a red X on a miss. */
function drawFlash(ctx, game, now) {
  if (!game.flash || now > game.flash.until) return;
  const { x, y, good } = game.flash;
  ctx.save();
  ctx.strokeStyle = good ? '#2fd47a' : '#ff5d5d';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, 22, 0, Math.PI * 2);
  ctx.stroke();
  if (!good) {
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 10);
    ctx.lineTo(x + 10, y + 10);
    ctx.moveTo(x + 10, y - 10);
    ctx.lineTo(x - 10, y + 10);
    ctx.stroke();
  }
  ctx.restore();
}

/** The "+points" floater after a find, fading over ~1 second. */
function drawFloater(ctx, game, now) {
  if (!game.lastGain || now - game.lastGainAt > 1000) return;
  const age = (now - game.lastGainAt) / 1000;
  ctx.save();
  ctx.globalAlpha = 1 - age;
  ctx.fillStyle = '#2fd47a';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`+${game.lastGain}`, 640, 108 - age * 24);
  ctx.restore();
  ctx.textAlign = 'left';
}

/** Draw the current frame. */
export function render(ctx, game, now) {
  ctx.fillStyle = '#0d0d1a';
  ctx.fillRect(0, 0, 1280, 720);
  drawHud(ctx, game);
  drawPanels(ctx, game, now);
  drawFooter(ctx, game);
  drawFlash(ctx, game, now);
  drawFloater(ctx, game, now);
  if (game.screen === SCREEN_TITLE) drawTitle(ctx, game, now);
  else if (game.screen === SCREEN_SCENE_CLEAR) drawSceneClear(ctx, game);
  else if (game.screen === SCREEN_WIN) drawWin(ctx, game);
  else if (game.screen === SCREEN_LOSE) drawLose(ctx, game);
}
