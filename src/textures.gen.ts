// @ts-check
// Source of this mod's generated images: `node packages/cli/cli.js textures mods-dev/veiculos` writes them.
// Each skin follows the box UV layout of its model file: per cube a color and a pattern.
import fs from 'node:fs';

const SKINS = {
  'textures/mob/carro.png': {
    model: './models/carro.geo.json', size: 256,
    colors: {
      chassi: [['#c8402f', 'paint'], ['#fff4c2', 'glow'], ['#fff4c2', 'glow'], ['#ff5040', 'glow'], ['#ff5040', 'glow'], ['#3a3f47', 'metal'], ['#3a3f47', 'metal']],
      cabine: [['#9fd3ea', 'glass'], ['#a8362a', 'paint']],
      roda_fe: [['#202326', 'tire']], roda_fd: [['#202326', 'tire']], roda_te: [['#202326', 'tire']], roda_td: [['#202326', 'tire']],
    },
  },
  'textures/mob/balao.png': {
    model: './models/balao.geo.json', size: 128,
    colors: {
      cesto: [['#9a6b3a', 'weave'], ['#5a4630'], ['#5a4630'], ['#5a4630'], ['#5a4630']],
      chama: [['#ffb347', 'glow']],
      envelope: [['#f2c14e', 'gores'], ['#e4572e', 'paint']],
    },
  },
};

const shade = (hex, k) => '#' + [1, 3, 5].map(i => Math.max(0, Math.min(255, Math.round(parseInt(hex.slice(i, i + 2), 16) * k))).toString(16).padStart(2, '0')).join('');

function faces([u, v], [w, h, d]) {
  return [
    [u + d, v, w, d, 1.2, 'top'], [u + d + w, v, w, d, 0.6, 'bottom'],
    [u, v + d, d, h, 0.88, 'side'], [u + d, v + d, w, h, 1, 'front'], [u + d + w, v + d, d, h, 0.88, 'side'], [u + 2 * d + w, v + d, w, h, 0.8, 'back'],
  ];
}

const PATTERNS = {
  plain: (x, y, w, h, edge) => (edge ? 0.72 : 1),
  // glossy car paint: a light streak across the top third, darker sills
  paint: (x, y, w, h, edge) => (edge ? 0.7 : y < h * 0.3 && (x + y) % 9 < 2 ? 1.25 : y > h * 0.8 ? 0.85 : 1),
  glass: (x, y, w, h, edge, face) => (edge ? 0.5 : face === 'top' ? 0.9 : (x - y + 40) % 12 < 2 ? 1.35 : 0.95),
  glow(x, y, w, h) { const r = Math.hypot(x - (w - 1) / 2, y - (h - 1) / 2) / Math.max(1, Math.hypot(w / 2, h / 2)); return 1.25 - r * 0.4; },
  metal: (x, y, w, h, edge) => (edge ? 0.6 : x % 4 === 0 ? 1.2 : 1),
  // tire with a lighter hub on the outer faces
  tire(x, y, w, h, edge, face) {
    if (face === 'side') { const r = Math.hypot(x - (w - 1) / 2, y - (h - 1) / 2); return r < 1.6 ? 3.2 : r < 2.4 ? 2 : r > 3.3 ? 0.7 : 1; }
    return y % 2 === 0 ? 0.75 : 1.1; // tread
  },
  weave: (x, y, w, h, edge) => (edge ? 0.6 : (x + (y % 2) * 2) % 4 < 2 ? 1.12 : 0.88),
  // balloon gores: vertical stripes in two colors, seams darker
  gores: (x, y, w, h, edge, face) => (face === 'top' || face === 'bottom' ? 1 : x % 6 === 0 ? 0.7 : Math.floor(x / 6) % 2 ? 1.08 : 0.82),
};

function skin({ model, colors, size }) {
  const geometry = JSON.parse(fs.readFileSync(new URL(model, import.meta.url), 'utf8'))['minecraft:geometry'][0];
  return {
    size,
    paint(set) {
      for (const bone of geometry.bones) bone.cubes.forEach((cube, i) => {
        const [base, pattern = 'plain'] = colors[bone.name][i] ?? colors[bone.name][0];
        const texel = PATTERNS[pattern];
        for (const [x0, y0, w, h, light, face] of faces(cube.uv, cube.size)) {
          for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
            const edge = x === 0 || y === 0 || x === w - 1 || y === h - 1;
            set(x0 + x, y0 + y, shade(base, (pattern === 'glow' ? 1 : light) * texel(x, y, w, h, edge, face)));
          }
        }
      });
    },
  };
}

export default Object.fromEntries(Object.entries(SKINS).map(([file, spec]) => [file, skin(spec)]));
