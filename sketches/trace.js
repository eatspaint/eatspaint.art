const palettes = require('@eatspaint/jp-color-palette');
const Random = require('canvas-sketch-util/random');

const DEFAULT_SEED = '';
const SEED = DEFAULT_SEED || Random.getRandomSeed();
console.log(`Seed: ${SEED}`);
Random.setSeed(SEED);

const settings = {
  animate: true,
  // duration: 6,
  // loop: true,
  dimensions: [ 2048, 2048 ]
};

const TWO_PI = 2 * Math.PI;

const sketch = () => {
  const PEN_SIZE = 3;
  const palette = Random.pick(palettes);
  const [background, foreground] = Random.shuffle(palette);
  const N1 = Random.range(0.0002, 0.003);
  const N2 = Random.range(0.0005, 0.005);
  const RAD_MULT = Random.range(0.025, 0.5);
  const [ROT0_RATE, ROT1_RATE, ROT2_RATE] = Random.shuffle([1, 2, 3, 5, 7, 11, 13]);
  const ROT0 = { rate: ROT0_RATE, size: Random.range(0.2, 0.5) };
  const ROT1 = { rate: ROT1_RATE, size: Random.range(0.1, ROT0.size) };
  const ROT2 = { rate: ROT2_RATE, size: Random.range(0.1, ROT1.size) };

  const ROT_DENSITY = 100;
  const PHI_STEP = TWO_PI / ((ROT0.rate + ROT1.rate + ROT2.rate) * ROT_DENSITY);

  const MAX_ARCS = 1000;
  const arcs = [];
  return ({ context, width, height, frame }) => {
    const ARC_RAD = Math.min(height, width) * RAD_MULT;
    const RAD_BASE = Math.min(width, height) * 0.5;
    const a = frame * PHI_STEP;

    const x = (
      (ROT0.size * Math.sin(a * ROT0.rate)) +
      (ROT1.size * Math.sin(a * ROT1.rate)) +
      (ROT2.size * Math.sin(a * ROT2.rate))
    ) * RAD_BASE;
    const y = (
      (ROT0.size * Math.cos(a * ROT0.rate)) +
      (ROT1.size * Math.cos(a * ROT1.rate)) +
      (ROT2.size * Math.cos(a * ROT2.rate))
    ) * RAD_BASE;
    const base = Random.noise2D(x * N1, y * N1) * TWO_PI;
    const size = Random.noise2D(x * N2, y * N2) * Math.PI * 0.5;
    const start = base - size;
    const stop = base + size;

    arcs.push([
      x + (width * 0.5),
      y + (height * 0.5),
      ((Random.noise1D(frame * 0.003) * 0.5) + 0.5) * ARC_RAD,
      start,
      stop,
      start > stop
    ]);
    if (arcs.length > MAX_ARCS) {
      arcs.splice(0, arcs.length - MAX_ARCS);
    }

    context.globalAlpha = 1;
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
    context.strokeStyle = foreground;
    context.lineCap = 'round';
    context.lineWidth = PEN_SIZE;
    arcs.forEach((arc, i) => {
      context.globalAlpha = (i / arcs.length) ** 3;
      context.beginPath();
      context.arc(...arc)
      context.stroke();
    });
  }
}

export { settings, sketch };
