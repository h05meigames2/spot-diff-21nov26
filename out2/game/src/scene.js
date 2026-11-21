// scene.js — the three spot-the-difference scenes of "Pasar Malam".
// Every scene is drawn procedurally on canvas from one draw function; the
// right panel calls the same function with altered=true, which applies that
// scene's differences by design (missing object, colour change, extra object,
// moved or rotated object). Nothing is loaded from outside: no images, no fonts.

/** Panel size every scene is drawn into. */
export const PANEL_W = 560;
export const PANEL_H = 420;

/** Deterministic random stream so both panels (and every screenshot) match. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A small filled circle. */
function dot(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/** A four-point star sparkle. */
function sparkle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

/** A soft radial glow behind a light source. */
function glow(ctx, x, y, r, color) {
  const g = ctx.createRadialGradient(x, y, 2, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// ---------------------------------------------------------------- scene 1
// "Pasar Malam": a night-market stall under string lights. 7 differences.

const S1_DIFFS = [
  { id: 'moon', x: 88, y: 62, r: 30, label: 'bulan hilang' },
  { id: 'bulb', x: 280, y: 46, r: 13, label: 'warna lampu berubah' },
  { id: 'stripe', x: 402, y: 128, r: 18, label: 'warna garis tenda berubah' },
  { id: 'orange', x: 296, y: 336, r: 16, label: 'jeruk hilang' },
  { id: 'lantern', x: 502, y: 182, r: 22, label: 'warna lampion berubah' },
  { id: 'cat', x: 148, y: 156, r: 26, label: 'kucing hilang' },
  { id: 'balloon', x: 62, y: 296, r: 20, label: 'balon tambahan' },
];

function drawNightMarket(ctx, altered) {
  const rng = mulberry32(11);
  // Sky.
  const sky = ctx.createLinearGradient(0, 0, 0, PANEL_H);
  sky.addColorStop(0, '#1b1740');
  sky.addColorStop(0.55, '#3a2a63');
  sky.addColorStop(1, '#7a4a6e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);
  // Stars.
  for (let i = 0; i < 46; i += 1) {
    const x = rng() * PANEL_W;
    const y = rng() * 170;
    sparkle(ctx, x, y, 1.5 + rng() * 2.5, 'rgba(255,244,200,0.9)');
  }
  // Moon (difference: missing on the right panel).
  if (!altered) {
    glow(ctx, 88, 62, 58, 'rgba(255,240,180,0.45)');
    dot(ctx, 88, 62, 26, '#ffeeb0');
    dot(ctx, 80, 56, 5, '#e8d28a');
    dot(ctx, 96, 70, 4, '#e8d28a');
    dot(ctx, 92, 52, 3, '#e8d28a');
  }
  // String lights across the top.
  ctx.strokeStyle = '#2c2140';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.quadraticCurveTo(PANEL_W / 2, 62, PANEL_W, 14);
  ctx.stroke();
  const bulbColors = ['#ff5d5d', '#ffd23f', '#7ee081', '#5db9ff', '#ff9ff3'];
  for (let i = 0; i < 11; i += 1) {
    const t = i / 10;
    const x = 20 + t * (PANEL_W - 40);
    const y = 18 + Math.sin(t * Math.PI) * 34;
    // Difference: the middle bulb is red on the left, green on the right.
    const color = i === 5 ? (altered ? '#2fd47a' : '#ff5d5d') : bulbColors[i % bulbColors.length];
    ctx.save();
    ctx.globalAlpha = 0.35;
    glow(ctx, x, y + 8, 16, color);
    ctx.restore();
    dot(ctx, x, y + 8, 6, color);
    ctx.fillStyle = '#3a2f55';
    ctx.fillRect(x - 3, y + 1, 6, 5);
  }
  // Distant rooftops.
  ctx.fillStyle = '#241c3e';
  ctx.fillRect(0, 210, 120, 210);
  ctx.fillStyle = '#2d2350';
  ctx.fillRect(440, 196, 120, 224);
  ctx.fillStyle = '#ffd23f';
  ctx.fillRect(30, 240, 16, 14);
  ctx.fillRect(66, 268, 16, 14);
  ctx.fillRect(470, 226, 16, 14);
  ctx.fillRect(506, 258, 16, 14);
  // Stall awning: red/white stripes.
  for (let i = 0; i < 7; i += 1) {
    // Difference: stripe 4 is red on the left, sky-blue on the right.
    let color = i % 2 === 0 ? '#e84545' : '#fff3e0';
    if (i === 4 && altered) color = '#5db9ff';
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(120 + i * 46, 150);
    ctx.lineTo(166 + i * 46, 150);
    ctx.lineTo(172 + i * 46, 196);
    ctx.lineTo(114 + i * 46, 196);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#8c2f2f';
  ctx.fillRect(112, 148, 336, 8);
  // Stall posts and counter.
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(126, 196, 12, 150);
  ctx.fillRect(426, 196, 12, 150);
  ctx.fillStyle = '#a4713e';
  ctx.fillRect(104, 330, 352, 18);
  ctx.fillStyle = '#7c4f27';
  ctx.fillRect(104, 348, 352, 62);
  // Fruit pyramid on the counter.
  const oranges = [
    [180, 322], [212, 322], [244, 322], [276, 322], [308, 322],
    [196, 300], [228, 300], [260, 300], [292, 300],
    [212, 278], [244, 278], [276, 278],
    [228, 256], [260, 256],
    [244, 234],
  ];
  oranges.forEach(([x, y], i) => {
    // Difference: one orange (index 3) is missing on the right panel.
    if (altered && i === 3) return;
    dot(ctx, x, y, 13, '#ff9f1c');
    dot(ctx, x - 4, y - 4, 3, '#ffc15e');
    ctx.fillStyle = '#2f9e44';
    ctx.beginPath();
    ctx.ellipse(x + 6, y - 12, 5, 3, 0.6, 0, Math.PI * 2);
    ctx.fill();
  });
  // Apples beside the pyramid.
  dot(ctx, 360, 316, 13, '#e03131');
  dot(ctx, 388, 316, 13, '#e03131');
  dot(ctx, 374, 294, 13, '#e03131');
  // Hanging lantern (difference: red left, teal right).
  ctx.strokeStyle = '#2c2140';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(502, 150);
  ctx.lineTo(502, 162);
  ctx.stroke();
  const lanternColor = altered ? '#2ec4b6' : '#ff4d4d';
  glow(ctx, 502, 182, 34, altered ? 'rgba(46,196,182,0.4)' : 'rgba(255,77,77,0.4)');
  ctx.fillStyle = lanternColor;
  ctx.beginPath();
  ctx.ellipse(502, 182, 15, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd23f';
  ctx.fillRect(495, 160, 14, 5);
  ctx.fillRect(495, 199, 14, 5);
  // Cat sitting on the stall roof (difference: missing on the right).
  if (!altered) {
    ctx.fillStyle = '#2b2b3a';
    ctx.beginPath();
    ctx.ellipse(148, 148, 20, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    dot(ctx, 148, 128, 11, '#2b2b3a');
    ctx.beginPath();
    ctx.moveTo(140, 120);
    ctx.lineTo(138, 108);
    ctx.lineTo(146, 116);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(156, 120);
    ctx.lineTo(158, 108);
    ctx.lineTo(150, 116);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffd23f';
    dot(ctx, 144, 127, 2, '#ffd23f');
    dot(ctx, 152, 127, 2, '#ffd23f');
    // Tail.
    ctx.strokeStyle = '#2b2b3a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(166, 152);
    ctx.quadraticCurveTo(184, 148, 180, 132);
    ctx.stroke();
  }
  // Balloons on the left (difference: one extra green balloon on the right).
  const balloons = [
    [48, 260, '#ff5d8f'], [78, 244, '#5db9ff'], [62, 220, '#ffd23f'],
  ];
  if (altered) balloons.push([62, 296, '#2fd47a']);
  balloons.forEach(([x, y, color]) => {
    ctx.strokeStyle = '#d8d8e8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y + 22);
    ctx.quadraticCurveTo(x + 8, y + 60, x - 4, y + 96);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, 14, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    dot(ctx, x - 5, y - 6, 3, 'rgba(255,255,255,0.55)');
  });
  // Ground.
  ctx.fillStyle = '#191430';
  ctx.fillRect(0, 396, PANEL_W, 24);
}

export const SCENE_NIGHT_MARKET = {
  id: 'pasar-malam',
  name: 'Pasar Malam',
  tagline: 'Lampu, lampion, dan kucing di atap tenda.',
  seconds: 90,
  diffs: S1_DIFFS,
  draw: drawNightMarket,
};

// ---------------------------------------------------------------- scene 2
// "Terumbu Karang": a coral reef at midday. 8 differences.

const S2_DIFFS = [
  { id: 'fish-color', x: 150, y: 122, r: 24, label: 'warna ikan berubah' },
  { id: 'starfish', x: 424, y: 344, r: 20, label: 'bintang laut hilang' },
  { id: 'bubbles', x: 302, y: 82, r: 16, label: 'gelembung tambahan' },
  { id: 'coral', x: 484, y: 300, r: 24, label: 'warna karang berubah' },
  { id: 'shell', x: 92, y: 362, r: 16, label: 'kerang hilang' },
  { id: 'seaweed', x: 252, y: 306, r: 18, label: 'rumput laut hilang' },
  { id: 'fish-missing', x: 384, y: 152, r: 20, label: 'ikan hilang' },
  { id: 'minnow', x: 502, y: 102, r: 14, label: 'ikan kecil tambahan' },
];

function drawFish(ctx, x, y, size, color, flip) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip ? -1 : 1, 1);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, size, size * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-size * 0.8, 0);
  ctx.lineTo(-size * 1.5, -size * 0.6);
  ctx.lineTo(-size * 1.5, size * 0.6);
  ctx.closePath();
  ctx.fill();
  dot(ctx, size * 0.55, -size * 0.12, size * 0.1, '#10243e');
  ctx.restore();
}

function drawCoral(ctx, x, y, h, color) {
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineWidth = 9;
  const branches = [[-14, -h * 0.55], [0, -h], [14, -h * 0.6], [-6, -h * 0.8], [8, -h * 0.75]];
  branches.forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + dx * 0.4, y + dy * 0.6, x + dx, y + dy);
    ctx.stroke();
  });
  dot(ctx, x, y - h, 7, color);
}

function drawReef(ctx, altered) {
  const rng = mulberry32(23);
  // Water.
  const water = ctx.createLinearGradient(0, 0, 0, PANEL_H);
  water.addColorStop(0, '#1d7fb8');
  water.addColorStop(0.6, '#2fa8c9');
  water.addColorStop(1, '#0e5f86');
  ctx.fillStyle = water;
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);
  // Sun rays.
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = '#fff8d6';
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(90 + i * 130, 0);
    ctx.lineTo(150 + i * 130, 0);
    ctx.lineTo(230 + i * 130, PANEL_H);
    ctx.lineTo(120 + i * 130, PANEL_H);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  // Sand.
  ctx.fillStyle = '#e8d29a';
  ctx.beginPath();
  ctx.moveTo(0, 360);
  ctx.quadraticCurveTo(140, 330, 280, 356);
  ctx.quadraticCurveTo(420, 380, PANEL_W, 352);
  ctx.lineTo(PANEL_W, PANEL_H);
  ctx.lineTo(0, PANEL_H);
  ctx.closePath();
  ctx.fill();
  // Pebbles on the sand.
  for (let i = 0; i < 14; i += 1) {
    dot(ctx, 20 + rng() * (PANEL_W - 40), 372 + rng() * 38, 3 + rng() * 4, '#c9ad72');
  }
  // Seaweed (difference: the middle tuft is missing on the right).
  const weeds = [[60, 340, 60], [150, 350, 76], [252, 344, 68], [330, 352, 56]];
  weeds.forEach(([x, y, h], i) => {
    if (altered && i === 2) return;
    ctx.strokeStyle = '#1f9d55';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x - 12, y - h * 0.6, x + 4, y - h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 10, y);
    ctx.quadraticCurveTo(x + 20, y - h * 0.5, x + 12, y - h * 0.85);
    ctx.stroke();
  });
  // Corals.
  drawCoral(ctx, 100, 356, 64, '#ff7f9e');
  drawCoral(ctx, 200, 360, 48, '#ff9f43');
  drawCoral(ctx, 484, 352, 70, altered ? '#7ee081' : '#b388ff');
  drawCoral(ctx, 440, 362, 40, '#ff6b9d');
  // Starfish (difference: missing on the right).
  if (!altered) {
    ctx.fillStyle = '#ff8c42';
    ctx.save();
    ctx.translate(424, 344);
    ctx.beginPath();
    for (let i = 0; i < 5; i += 1) {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
      const a2 = a + Math.PI / 5;
      ctx.lineTo(Math.cos(a) * 16, Math.sin(a) * 16);
      ctx.lineTo(Math.cos(a2) * 7, Math.sin(a2) * 7);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    dot(ctx, 424, 344, 3, '#e56b1f');
  }
  // Shell (difference: missing on the right).
  if (!altered) {
    ctx.fillStyle = '#f7f0ff';
    ctx.beginPath();
    ctx.arc(92, 362, 13, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#c9b8e8';
    ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(92 + i * 6, 362);
      ctx.lineTo(92 + i * 9, 350);
      ctx.stroke();
    }
  }
  // Fish. Difference 1: the big fish is blue left, yellow right.
  drawFish(ctx, 150, 122, 26, altered ? '#ffd23f' : '#3a86ff', false);
  drawFish(ctx, 240, 200, 18, '#ff6b9d', true);
  // Difference: this fish is missing on the right.
  if (!altered) drawFish(ctx, 384, 152, 20, '#2fd47a', false);
  drawFish(ctx, 470, 220, 15, '#ff9f43', true);
  // Difference: a tiny extra fish on the right.
  if (altered) drawFish(ctx, 502, 102, 10, '#b388ff', false);
  // Bubbles.
  const bubbles = [[120, 90, 5], [132, 66, 4], [146, 44, 6], [200, 150, 4], [212, 128, 5], [440, 90, 5], [452, 64, 4]];
  if (altered) bubbles.push([302, 82, 6], [312, 60, 4], [292, 58, 4]);
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 1.5;
  bubbles.forEach(([x, y, r]) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  });
  // A shy turtle peeking from the right edge.
  ctx.fillStyle = '#4caf7d';
  ctx.beginPath();
  ctx.ellipse(536, 260, 26, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  dot(ctx, 558, 252, 8, '#4caf7d');
  dot(ctx, 560, 250, 2, '#10243e');
}

export const SCENE_REEF = {
  id: 'terumbu-karang',
  name: 'Terumbu Karang',
  tagline: 'Ikan, karang, dan bintang laut di laut biru.',
  seconds: 75,
  diffs: S2_DIFFS,
  draw: drawReef,
};

// ---------------------------------------------------------------- scene 3
// "Stasiun Antariksa": an orbital station above the Moon. 10 differences.

const S3_DIFFS = [
  { id: 'ring', x: 402, y: 112, r: 32, label: 'cincin planet hilang' },
  { id: 'astronaut', x: 122, y: 222, r: 24, label: 'astronaut hilang' },
  { id: 'flag', x: 482, y: 332, r: 18, label: 'warna bendera berubah' },
  { id: 'comet', x: 302, y: 62, r: 14, label: 'komet tambahan' },
  { id: 'window', x: 202, y: 152, r: 16, label: 'warna jendela roket berubah' },
  { id: 'crater', x: 352, y: 372, r: 16, label: 'kawah hilang' },
  { id: 'dish', x: 520, y: 202, r: 22, label: 'antena berputar' },
  { id: 'planet', x: 92, y: 92, r: 26, label: 'warna planet kecil berubah' },
  { id: 'antenna', x: 252, y: 252, r: 14, label: 'antena tambahan' },
  { id: 'star', x: 452, y: 52, r: 12, label: 'bintang hilang' },
];

function drawStation(ctx, altered) {
  const rng = mulberry32(37);
  // Deep space.
  ctx.fillStyle = '#070b1e';
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);
  // Stars (difference: one bright star missing on the right).
  for (let i = 0; i < 70; i += 1) {
    const x = rng() * PANEL_W;
    const y = rng() * 300;
    sparkle(ctx, x, y, 1 + rng() * 2, 'rgba(255,255,255,0.85)');
  }
  if (!altered) sparkle(ctx, 452, 52, 5, '#fff7ae');
  // Small planet (difference: orange left, teal right).
  dot(ctx, 92, 92, 22, altered ? '#2ec4b6' : '#ff8c42');
  dot(ctx, 84, 86, 5, 'rgba(0,0,0,0.25)');
  dot(ctx, 100, 100, 4, 'rgba(0,0,0,0.25)');
  // Ringed planet (difference: the ring is missing on the right).
  dot(ctx, 402, 112, 30, '#e8b04b');
  if (!altered) {
    ctx.strokeStyle = '#d9c9a3';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(402, 112, 52, 13, -0.35, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Difference: a comet streaks across on the right only.
  if (altered) {
    const g = ctx.createLinearGradient(280, 48, 330, 78);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(255,255,255,0.9)');
    ctx.strokeStyle = g;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(280, 48);
    ctx.lineTo(326, 76);
    ctx.stroke();
    dot(ctx, 330, 78, 5, '#ffffff');
  }
  // Rocket.
  ctx.save();
  ctx.translate(202, 152);
  ctx.rotate(-0.5);
  ctx.fillStyle = '#e8ecf4';
  ctx.beginPath();
  ctx.moveTo(0, -34);
  ctx.quadraticCurveTo(16, -10, 14, 22);
  ctx.lineTo(-14, 22);
  ctx.quadraticCurveTo(-16, -10, 0, -34);
  ctx.fill();
  ctx.fillStyle = '#e84545';
  ctx.beginPath();
  ctx.moveTo(0, -34);
  ctx.quadraticCurveTo(8, -18, 6, -8);
  ctx.lineTo(-6, -8);
  ctx.quadraticCurveTo(-8, -18, 0, -34);
  ctx.fill();
  // Difference: the porthole is blue left, amber right.
  dot(ctx, 0, 2, 8, altered ? '#ffb703' : '#5db9ff');
  ctx.strokeStyle = '#9aa3b2';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 2, 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#ff9f1c';
  ctx.beginPath();
  ctx.moveTo(-10, 22);
  ctx.lineTo(10, 22);
  ctx.lineTo(0, 44);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // Astronaut (difference: missing on the right).
  if (!altered) {
    ctx.save();
    ctx.translate(122, 222);
    ctx.rotate(0.25);
    ctx.fillStyle = '#f2f4f8';
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    dot(ctx, 0, -26, 12, '#f2f4f8');
    ctx.fillStyle = '#9fd8ff';
    ctx.beginPath();
    ctx.arc(0, -26, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f2f4f8';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-14, -6);
    ctx.lineTo(-28, 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(14, -6);
    ctx.lineTo(26, -16);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-8, 18);
    ctx.lineTo(-14, 34);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, 18);
    ctx.lineTo(16, 32);
    ctx.stroke();
    // Tether.
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(10, 30);
    ctx.quadraticCurveTo(60, 90, 130, 80);
    ctx.stroke();
    ctx.restore();
  }
  // Space station module + solar panels.
  ctx.fillStyle = '#c8ccd8';
  ctx.fillRect(230, 240, 120, 34);
  ctx.fillStyle = '#8f96a8';
  ctx.fillRect(230, 240, 120, 8);
  dot(ctx, 290, 257, 10, '#5db9ff');
  ctx.fillStyle = '#274b8f';
  ctx.fillRect(150, 248, 70, 18);
  ctx.fillRect(360, 248, 70, 18);
  ctx.strokeStyle = '#9fd8ff';
  ctx.lineWidth = 1;
  for (let i = 1; i < 5; i += 1) {
    ctx.beginPath();
    ctx.moveTo(150 + i * 14, 248);
    ctx.lineTo(150 + i * 14, 266);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(360 + i * 14, 248);
    ctx.lineTo(360 + i * 14, 266);
    ctx.stroke();
  }
  // Difference: an extra antenna on the station, right panel only.
  if (altered) {
    ctx.strokeStyle = '#c8ccd8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(252, 240);
    ctx.lineTo(252, 214);
    ctx.stroke();
    dot(ctx, 252, 212, 4, '#ff5d5d');
  }
  // Satellite dish (difference: tilted the other way on the right).
  ctx.save();
  ctx.translate(520, 202);
  ctx.rotate(altered ? 0.9 : -0.35);
  ctx.strokeStyle = '#c8ccd8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 22);
  ctx.stroke();
  ctx.fillStyle = '#e8ecf4';
  ctx.beginPath();
  ctx.arc(0, -4, 14, 0, Math.PI);
  ctx.fill();
  ctx.restore();
  // Moon surface.
  ctx.fillStyle = '#b8bcc9';
  ctx.beginPath();
  ctx.moveTo(0, 340);
  ctx.quadraticCurveTo(140, 322, 280, 344);
  ctx.quadraticCurveTo(420, 366, PANEL_W, 342);
  ctx.lineTo(PANEL_W, PANEL_H);
  ctx.lineTo(0, PANEL_H);
  ctx.closePath();
  ctx.fill();
  // Craters (difference: one crater missing on the right).
  const craters = [[120, 372, 12], [220, 388, 9], [352, 372, 13], [460, 384, 10]];
  craters.forEach(([x, y, r], i) => {
    if (altered && i === 2) return;
    ctx.fillStyle = '#9aa0b0';
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  // Flag on the Moon (difference: red left, green right).
  ctx.strokeStyle = '#5a5f6e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(482, 332);
  ctx.lineTo(482, 292);
  ctx.stroke();
  ctx.fillStyle = altered ? '#2fd47a' : '#e84545';
  ctx.beginPath();
  ctx.moveTo(482, 292);
  ctx.lineTo(508, 298);
  ctx.lineTo(482, 306);
  ctx.closePath();
  ctx.fill();
}

export const SCENE_STATION = {
  id: 'stasiun-antariksa',
  name: 'Stasiun Antariksa',
  tagline: 'Roket, astronaut, dan cincin Saturnus.',
  seconds: 60,
  diffs: S3_DIFFS,
  draw: drawStation,
};

/** All scenes in play order: difficulty rises (7, then 8, then 10 differences; less time). */
export const SCENES = [SCENE_NIGHT_MARKET, SCENE_REEF, SCENE_STATION];
