// levels.js — the three levels of "Pasar Pagi".
// Each difference names its hotspots (viewBox coords) and how to apply it to
// the RIGHT panel (a clone of the left one). apply() only touches the clone.
function removeById(root, id) {
  const n = root.querySelector(`#${id}`);
  if (n) n.remove();
}
function fillAll(root, selector, fill) {
  root.querySelectorAll(selector).forEach((n) => n.setAttribute('fill', fill));
}
function setText(root, id, text) {
  const n = root.querySelector(`#${id}`);
  if (n) n.textContent = text;
}

export const LEVELS = [
  {
    n: 1,
    name: 'Pasar Pagi',
    variant: 'pagi',
    timeLimit: 180,
    diffs: [
      { id: 'cat', label: 'Kucing di konter hilang', hotspots: [{ x: 545, y: 272, r: 32 }],
        apply: (root) => removeById(root, 'cat') },
      { id: 'lantern', label: 'Warna lampion tengah berubah', hotspots: [{ x: 320, y: 106, r: 26 }],
        apply: (root) => fillAll(root, '#lantern-m .body', '#3d9e57') },
      { id: 'stripe', label: 'Warna garis tenda berubah', hotspots: [{ x: 200, y: 32, r: 30 }],
        apply: (root) => fillAll(root, '#stripe-2 *', '#3d6fd9') },
      { id: 'orange', label: 'Satu jeruk hilang', hotspots: [{ x: 146, y: 276, r: 22 }],
        apply: (root) => removeById(root, 'orange-3') },
      { id: 'price', label: 'Harga di papan berubah', hotspots: [{ x: 116, y: 249, r: 26 }],
        apply: (root) => setText(root, 'sign-price', '7K') },
      { id: 'bird', label: 'Burung di atas tenda hilang', hotspots: [{ x: 470, y: 74, r: 24 }],
        apply: (root) => removeById(root, 'bird') },
      { id: 'flower', label: 'Warna bunga berubah', hotspots: [{ x: 250, y: 258, r: 24 }],
        apply: (root) => fillAll(root, '#flower .petal', '#f2c230') },
    ],
  },
  {
    n: 2,
    name: 'Pasar Sore',
    variant: 'sore',
    timeLimit: 180,
    diffs: [
      { id: 'lantern', label: 'Lampion kiri hilang', hotspots: [{ x: 110, y: 106, r: 26 }],
        apply: (root) => removeById(root, 'lantern-l') },
      { id: 'sign', label: 'Tulisan papan berubah', hotspots: [{ x: 116, y: 230, r: 26 }],
        apply: (root) => setText(root, 'sign-name', 'TEH') },
      { id: 'cabbage', label: 'Satu kubis hilang', hotspots: [{ x: 100, y: 350, r: 22 }],
        apply: (root) => removeById(root, 'cabbage-3') },
      { id: 'cat', label: 'Kucing pindah ke lantai', hotspots: [{ x: 385, y: 368, r: 30 }, { x: 545, y: 272, r: 30 }],
        apply: (root) => {
          const cat = root.querySelector('#cat');
          if (cat) cat.setAttribute('transform', 'translate(-160 92)');
        } },
      { id: 'sack', label: 'Satu karung bertambah', hotspots: [{ x: 612, y: 370, r: 24 }],
        apply: (root) => {
          const sacks = root.querySelector('#sacks');
          if (!sacks) return;
          const NS = 'http://www.w3.org/2000/svg';
          const e = document.createElementNS(NS, 'ellipse');
          e.setAttribute('cx', 614); e.setAttribute('cy', 370);
          e.setAttribute('rx', 20); e.setAttribute('ry', 14); e.setAttribute('fill', '#cbb28a');
          sacks.appendChild(e);
        } },
      { id: 'sun', label: 'Matahari jadi bulan', hotspots: [{ x: 588, y: 128, r: 34 }],
        apply: (root) => {
          removeById(root, 'sun-rays');
          fillAll(root, '#sun circle', '#e8e4d2');
          root.querySelectorAll('#sun path').forEach((n) => n.setAttribute('stroke', '#e8e4d2'));
        } },
      { id: 'stripe', label: 'Warna garis tenda berubah', hotspots: [{ x: 440, y: 32, r: 30 }],
        apply: (root) => fillAll(root, '#stripe-5 *', '#3d9e57') },
    ],
  },
  {
    n: 3,
    name: 'Pasar Ramai',
    variant: 'ramai',
    timeLimit: 240,
    diffs: [
      { id: 'cat', label: 'Kucing di konter hilang', hotspots: [{ x: 545, y: 272, r: 32 }],
        apply: (root) => removeById(root, 'cat') },
      { id: 'lantern', label: 'Lampion kanan hilang', hotspots: [{ x: 530, y: 106, r: 26 }],
        apply: (root) => removeById(root, 'lantern-r') },
      { id: 'stripe', label: 'Warna garis tenda berubah', hotspots: [{ x: 40, y: 32, r: 30 }],
        apply: (root) => fillAll(root, '#stripe-0 *', '#3d9e57') },
      { id: 'banana', label: 'Satu pisang hilang', hotspots: [{ x: 470, y: 272, r: 24 }],
        apply: (root) => removeById(root, 'banana-3') },
      { id: 'price', label: 'Harga di papan berubah', hotspots: [{ x: 116, y: 249, r: 26 }],
        apply: (root) => setText(root, 'sign-price', '9K') },
      { id: 'bird', label: 'Burung di atas tenda hilang', hotspots: [{ x: 470, y: 74, r: 24 }],
        apply: (root) => removeById(root, 'bird') },
      { id: 'flower', label: 'Warna bunga berubah', hotspots: [{ x: 250, y: 258, r: 24 }],
        apply: (root) => fillAll(root, '#flower .petal', '#3d6fd9') },
      { id: 'jar', label: 'Toples kaca hilang', hotspots: [{ x: 391, y: 272, r: 26 }],
        apply: (root) => removeById(root, 'jar') },
      { id: 'chicken', label: 'Ayam di lantai hilang', hotspots: [{ x: 200, y: 378, r: 28 }],
        apply: (root) => removeById(root, 'chicken') },
      { id: 'cloud', label: 'Awan hilang', hotspots: [{ x: 330, y: 88, r: 28 }],
        apply: (root) => removeById(root, 'cloud2') },
    ],
  },
];
