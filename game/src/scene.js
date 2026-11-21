// scene.js — procedural "Pasar Pagi" market-stall scene, drawn as inline SVG.
// One builder draws the left panel; the right panel is a clone with the level's
// differences applied. No photos, no copied art: every shape is drawn here.
const NS = 'http://www.w3.org/2000/svg';

export function el(tag, attrs = {}, parent = null) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (parent) parent.appendChild(n);
  return n;
}

const PALETTES = {
  pagi: { sky: '#bfe3f2', wall: '#f3e2c7', floor: '#d9a066', awningA: '#d94f3d', awningB: '#fff3e0' },
  sore: { sky: '#f7c98b', wall: '#eecfa8', floor: '#cf9463', awningA: '#b8452f', awningB: '#ffe9c4' },
  ramai: { sky: '#bfe3f2', wall: '#f3e2c7', floor: '#d9a066', awningA: '#d94f3d', awningB: '#fff3e0' },
};

// Draw the base scene into a fresh <svg viewBox="0 0 640 420"> and return it.
// `variant` picks the palette and extra props ('ramai' adds a chicken).
export function renderScene(variant = 'pagi') {
  const P = PALETTES[variant] || PALETTES.pagi;
  const svg = el('svg', { viewBox: '0 0 640 420', role: 'img', 'aria-label': 'Pasar pagi: sebuah los pasar' });

  // Sky, sun, clouds. (The awning covers y 0..64, so sky objects sit below it.)
  el('rect', { x: 0, y: 0, width: 640, height: 190, fill: P.sky }, svg);
  const sun = el('g', { id: 'sun' }, svg);
  const rays = el('g', { id: 'sun-rays' }, sun);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const x1 = 588 + Math.cos(a) * 34, y1 = 128 + Math.sin(a) * 34;
    const x2 = 588 + Math.cos(a) * 44, y2 = 128 + Math.sin(a) * 44;
    el('line', { x1, y1, x2, y2, stroke: '#f2a03d', 'stroke-width': 4, 'stroke-linecap': 'round' }, rays);
  }
  el('circle', { cx: 588, cy: 128, r: 28, fill: '#ffd23e' }, sun);
  el('circle', { cx: 579, cy: 124, r: 3, fill: '#7a4a12' }, sun);
  el('circle', { cx: 597, cy: 124, r: 3, fill: '#7a4a12' }, sun);
  el('path', { d: 'M 579 136 Q 588 142 597 136', stroke: '#7a4a12', 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' }, sun);
  const cloud1 = el('g', { id: 'cloud1', fill: '#ffffff', opacity: 0.9 }, svg);
  el('ellipse', { cx: 120, cy: 102, rx: 34, ry: 14 }, cloud1);
  el('ellipse', { cx: 146, cy: 94, rx: 26, ry: 14 }, cloud1);
  el('ellipse', { cx: 168, cy: 104, rx: 22, ry: 11 }, cloud1);
  const cloud2 = el('g', { id: 'cloud2', fill: '#ffffff', opacity: 0.9 }, svg);
  el('ellipse', { cx: 315, cy: 88, rx: 30, ry: 12 }, cloud2);
  el('ellipse', { cx: 338, cy: 81, rx: 22, ry: 12 }, cloud2);
  el('ellipse', { cx: 358, cy: 90, rx: 18, ry: 10 }, cloud2);

  // Back wall and floor.
  el('rect', { x: 0, y: 190, width: 640, height: 150, fill: P.wall }, svg);
  el('rect', { x: 0, y: 340, width: 640, height: 80, fill: P.floor }, svg);
  for (let x = 0; x <= 640; x += 80) el('line', { x1: x, y1: 340, x2: x - 30, y2: 420, stroke: '#b97e4e', 'stroke-width': 2 }, svg);

  // Awning: 8 stripes with a scalloped edge.
  for (let i = 0; i < 8; i++) {
    const g = el('g', { id: `stripe-${i}` }, svg);
    const fill = i % 2 === 0 ? P.awningA : P.awningB;
    el('rect', { x: i * 80, y: 0, width: 80, height: 64, fill }, g);
    el('circle', { cx: i * 80 + 40, cy: 64, r: 14, fill }, g);
  }
  // Stall posts.
  el('rect', { x: 18, y: 64, width: 12, height: 276, fill: '#8a5a33' }, svg);
  el('rect', { x: 610, y: 64, width: 12, height: 276, fill: '#8a5a33' }, svg);

  // Bird perched on the awning's scalloped edge (drawn after the awning so it shows).
  const bird = el('g', { id: 'bird' }, svg);
  el('ellipse', { cx: 470, cy: 74, rx: 11, ry: 7, fill: '#4a6b8a' }, bird);
  el('circle', { cx: 479, cy: 69, r: 5.5, fill: '#4a6b8a' }, bird);
  el('path', { d: 'M 484 68 L 491 70 L 484 72 Z', fill: '#f2a03d' }, bird);
  el('circle', { cx: 481, cy: 67.5, r: 1.2, fill: '#fff' }, bird);
  el('path', { d: 'M 462 76 Q 470 81 478 76', stroke: '#4a6b8a', 'stroke-width': 2, fill: 'none' }, bird);

  // Hanging lanterns.
  const lanterns = [
    { id: 'lantern-l', x: 110, body: '#e2574c' },
    { id: 'lantern-m', x: 320, body: '#d94f3d' },
    { id: 'lantern-r', x: 530, body: '#f2a03d' },
  ];
  for (const L of lanterns) {
    const g = el('g', { id: L.id }, svg);
    el('line', { x1: L.x, y1: 64, x2: L.x, y2: 88, stroke: '#7a4a12', 'stroke-width': 2 }, g);
    el('rect', { x: L.x - 6, y: 88, width: 12, height: 6, fill: '#7a4a12' }, g);
    el('ellipse', { class: 'body', cx: L.x, cy: 106, rx: 14, ry: 18, fill: L.body }, g);
    el('line', { x1: L.x, y1: 124, x2: L.x, y2: 134, stroke: '#7a4a12', 'stroke-width': 2 }, g);
  }

  // Counter.
  el('rect', { x: 24, y: 292, width: 592, height: 14, fill: '#c08a4e' }, svg);
  el('rect', { x: 30, y: 306, width: 580, height: 40, fill: '#a9713f' }, svg);
  el('line', { x1: 30, y1: 322, x2: 610, y2: 322, stroke: '#8a5a33', 'stroke-width': 2 }, svg);

  // Chalkboard price sign, hung on the wall above the counter (clear of the baskets).
  const sign = el('g', { id: 'sign' }, svg);
  el('rect', { x: 58, y: 206, width: 116, height: 50, rx: 4, fill: '#2e4a3a' }, sign);
  el('rect', { x: 62, y: 210, width: 108, height: 42, rx: 3, fill: 'none', stroke: '#7fae8e', 'stroke-width': 1.5 }, sign);
  const signName = el('text', { id: 'sign-name', x: 116, y: 230, 'text-anchor': 'middle', fill: '#fdf6d8', 'font-size': 21, 'font-weight': 'bold', 'font-family': 'sans-serif' }, sign);
  signName.textContent = 'KOPI';
  const signPrice = el('text', { id: 'sign-price', x: 116, y: 249, 'text-anchor': 'middle', fill: '#ffd23e', 'font-size': 17, 'font-family': 'sans-serif' }, sign);
  signPrice.textContent = '5K';

  // Basket A: oranges.
  const basketA = el('g', { id: 'basket-a' }, svg);
  const oranges = [[110, 276], [128, 270], [146, 276], [119, 286], [137, 286]];
  oranges.forEach(([cx, cy], i) => {
    el('circle', { id: `orange-${i + 1}`, cx, cy, r: 9, fill: '#f28c1d' }, basketA);
    el('circle', { cx: cx - 3, cy: cy - 3, r: 2.5, fill: '#f7b267' }, basketA);
  });
  el('path', { d: 'M 96 282 L 164 282 L 156 306 L 104 306 Z', fill: '#9c6b3c' }, basketA);
  el('line', { x1: 104, y1: 292, x2: 156, y2: 292, stroke: '#7a4f27', 'stroke-width': 2 }, basketA);

  // Flower pot.
  const pot = el('g', { id: 'pot' }, svg);
  el('line', { x1: 250, y1: 286, x2: 250, y2: 264, stroke: '#3d7a3a', 'stroke-width': 3 }, pot);
  const flower = el('g', { id: 'flower' }, pot);
  for (let i = 0; i < 5; i++) {
    const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    el('circle', { class: 'petal', cx: 250 + Math.cos(a) * 9, cy: 258 + Math.sin(a) * 9, r: 6, fill: '#e2574c' }, flower);
  }
  el('circle', { cx: 250, cy: 258, r: 5, fill: '#f2c230' }, flower);
  el('path', { d: 'M 234 286 L 266 286 L 261 306 L 239 306 Z', fill: '#b45a32' }, pot);

  // Basket B: apples.
  const basketB = el('g', { id: 'basket-b' }, svg);
  [[306, 274], [324, 270], [340, 276], [316, 286]].forEach(([cx, cy]) => {
    el('circle', { cx, cy, r: 9, fill: '#c0392b' }, basketB);
    el('circle', { cx: cx - 3, cy: cy - 3, r: 2.5, fill: '#e57373' }, basketB);
  });
  el('path', { d: 'M 292 282 L 356 282 L 348 306 L 300 306 Z', fill: '#9c6b3c' }, basketB);

  // Glass jar.
  const jar = el('g', { id: 'jar' }, svg);
  el('rect', { x: 378, y: 252, width: 26, height: 40, rx: 4, fill: '#bfe3f2', opacity: 0.85, stroke: '#7fa8bf', 'stroke-width': 1.5 }, jar);
  el('rect', { x: 376, y: 246, width: 30, height: 8, rx: 2, fill: '#8a5a33' }, jar);
  el('circle', { cx: 386, cy: 280, r: 3, fill: '#5da85a' }, jar);
  el('circle', { cx: 394, cy: 284, r: 3, fill: '#d94f3d' }, jar);
  el('circle', { cx: 398, cy: 276, r: 3, fill: '#f2c230' }, jar);

  // Basket C: bananas.
  const basketC = el('g', { id: 'basket-c' }, svg);
  const bananas = [
    'M 448 268 Q 462 292 486 280',
    'M 452 262 Q 468 288 492 274',
    'M 458 258 Q 474 284 496 268',
  ];
  bananas.forEach((d, i) => {
    el('path', { id: `banana-${i + 1}`, d, stroke: '#f2c230', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, basketC);
  });
  el('path', { d: 'M 440 282 L 504 282 L 496 306 L 448 306 Z', fill: '#9c6b3c' }, basketC);

  // Cat sitting on the counter.
  const cat = el('g', { id: 'cat' }, svg);
  el('ellipse', { cx: 542, cy: 286, rx: 26, ry: 13, fill: '#e8a04c' }, cat);
  el('circle', { cx: 564, cy: 270, r: 12, fill: '#e8a04c' }, cat);
  el('path', { d: 'M 556 260 L 554 248 L 563 257 Z', fill: '#e8a04c' }, cat);
  el('path', { d: 'M 566 258 L 570 247 L 574 258 Z', fill: '#e8a04c' }, cat);
  el('circle', { cx: 568, cy: 268, r: 1.6, fill: '#3a2a1a' }, cat);
  el('path', { d: 'M 520 282 Q 506 272 512 260', stroke: '#e8a04c', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, cat);
  el('line', { x1: 570, y1: 276, x2: 578, y2: 276, stroke: '#3a2a1a', 'stroke-width': 1.4 }, cat);
  el('line', { x1: 570, y1: 279, x2: 578, y2: 280, stroke: '#3a2a1a', 'stroke-width': 1.4 }, cat);

  // Crate of cabbages on the floor, bottom left.
  const crate = el('g', { id: 'crate' }, svg);
  el('rect', { x: 36, y: 352, width: 92, height: 34, fill: '#8a5a33' }, crate);
  el('line', { x1: 36, y1: 364, x2: 128, y2: 364, stroke: '#6e4525', 'stroke-width': 2 }, crate);
  el('line', { x1: 36, y1: 376, x2: 128, y2: 376, stroke: '#6e4525', 'stroke-width': 2 }, crate);
  [[56, 350], [78, 344], [100, 350]].forEach(([cx, cy], i) => {
    el('circle', { id: `cabbage-${i + 1}`, cx, cy, r: 11, fill: '#5da85a' }, crate);
    el('circle', { cx: cx - 3, cy: cy - 3, r: 3, fill: '#8ecb8a' }, crate);
  });

  // Rice sacks on the floor, bottom right.
  const sacks = el('g', { id: 'sacks' }, svg);
  el('ellipse', { cx: 545, cy: 370, rx: 26, ry: 16, fill: '#cbb28a' }, sacks);
  el('ellipse', { cx: 588, cy: 372, rx: 24, ry: 15, fill: '#cbb28a' }, sacks);
  el('path', { d: 'M 538 358 L 552 358', stroke: '#8a6d4b', 'stroke-width': 2 }, sacks);
  el('path', { d: 'M 581 360 L 595 360', stroke: '#8a6d4b', 'stroke-width': 2 }, sacks);

  // Chicken (only in the 'ramai' variant).
  if (variant === 'ramai') {
    const ch = el('g', { id: 'chicken' }, svg);
    el('ellipse', { cx: 200, cy: 380, rx: 18, ry: 12, fill: '#fff3e0' }, ch);
    el('circle', { cx: 216, cy: 368, r: 8, fill: '#fff3e0' }, ch);
    el('path', { d: 'M 223 367 L 230 369 L 223 371 Z', fill: '#f2a03d' }, ch);
    el('circle', { cx: 218, cy: 366, r: 1.5, fill: '#3a2a1a' }, ch);
    el('path', { d: 'M 212 361 Q 214 355 218 360', fill: '#d94f3d' }, ch);
    el('line', { x1: 194, y1: 391, x2: 194, y2: 398, stroke: '#f2a03d', 'stroke-width': 2 }, ch);
    el('line', { x1: 206, y1: 391, x2: 206, y2: 398, stroke: '#f2a03d', 'stroke-width': 2 }, ch);
    el('path', { d: 'M 184 378 Q 192 384 200 378', stroke: '#d9c7a8', 'stroke-width': 2, fill: 'none' }, ch);
  }

  return svg;
}
