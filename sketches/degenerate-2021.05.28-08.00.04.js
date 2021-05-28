const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
import palettes from '@eatspaint/jp-color-palette';

const settings = {
  animate: true,
  duration: 60,
  loop: true,
  dimensions: [2048, 2048]
};

const GROW = 15;
const THETA_STEP = 3;

class Spiral {
  constructor({ origin, n, color, context, width, step, grow = GROW, }) {
    this.n = n;
    this.color = color;
    this.context = context;
    this.origin = origin;
    this.width = width;
    this.step = step;
    this.grow = grow;
  }

  draw(t) {
    let theta = 0;
    let dist = 0;
    const { context, n, origin, color, width, step, grow } = this;
    const [xOrigin, yOrigin] = origin;
    // increase the move angle with t
    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = width;
    context.moveTo(...origin);
    for (let i = 0; i < n; i++) {
      const x = xOrigin + (dist * Math.cos(theta));
      const y = yOrigin + (dist * Math.sin(theta));
      context.lineTo(x, y);
      theta += t * step;
      dist += grow;
    }
    context.stroke();
  }
}

const sketch = () => {
  const palette = random.shuffle(random.pick(palettes));
  return ({ context, width, height, playhead }) => {
    context.fillStyle = palette[0];
    context.fillRect(0, 0, width, height)
    for (let i = 0; i < palette.length -1; i++) {
      const spiral = new Spiral({
        origin: [width / 2, height / 2],
        n: 100,
        color: palette[i + 1],
        context,
        step: i + THETA_STEP,
        width: 5
      });
      spiral.draw(playhead * 0.5);
    }
  };
};

canvasSketch(sketch, settings);
