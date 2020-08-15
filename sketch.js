const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
import palettes from '@eatspaint/jp-color-palette';

const settings = {
  dimensions: [ 2048, 2048 ]
};

const sketch = () => {
  const palette = random.shuffle(random.pick(palettes));
  return ({ context, width, height }) => {
    const STEP = random.rangeFloor(30, height / 4);
    const SIZE = random.rangeFloor(25, STEP);
    const [bg, ...fg] = palette;
    context.fillStyle = bg;
    context.fillRect(0, 0, width, height);
    
    const rows = Math.floor(height / STEP);
    const columns = Math.floor(width / STEP);

    const xOffset = (width % STEP) / 2;
    const yOffset = (height % STEP) / 2;

    const pad = (STEP - SIZE) / 2;

    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        const x = xOffset + i * STEP;
        const y = yOffset + j * STEP;

        const grow = random.pick([0]);

        context.fillStyle = random.pick(fg);
        context.fillRect(
          x + pad,
          y + pad,
          STEP * grow + SIZE,
          STEP * grow + SIZE);
      }
    }
  };
};

canvasSketch(sketch, settings);
