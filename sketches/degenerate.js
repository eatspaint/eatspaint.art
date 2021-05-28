const random = require('canvas-sketch-util/random');
import palettes from '@eatspaint/jp-color-palette';

const settings = {
  animate: true,
  dimensions: [2048, 2048]
};

// Affects spacing between arms of the spiral
const GROW = random.rangeFloor(10, 30);
// Affects spacing between spirals
const GROW_SPREAD = random.rangeFloor(1, 5);
// Affects how quickly the spiral grows
const THETA_STEP = random.rangeFloor(3, 10);
// Hex opacity value 00-FF
const OPACITY = random.pick(['AA', 'CC', 'EE']);
// Line weight
const THICKNESS = random.rangeFloor(1, 10) * 5;
// Fidelity of spiral, higher numbers will take longer to degrade
const NODES = 100;

class Spiral {
  constructor({
    origin,
    n,
    color,
    context,
    width, 
    step,
    grow,
  }) {
    this.n = n;
    this.color = `${color}${OPACITY}`;
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
    // setup path
    context.beginPath();
    context.strokeStyle = color;
    context.lineCap = 'round';
    context.lineWidth = width;
    // draw spiral
    context.moveTo(...origin);
    for (let i = 0; i < n; i++) {
      const x = xOrigin + (dist * Math.cos(theta));
      const y = yOrigin + (dist * Math.sin(theta));
      context.lineTo(x, y);
      // iterate theta, taking bigger steps with respect to time (t)
      theta += t * step;
      dist += grow;
    }
    context.stroke();
  }
}

const sketch = () => {
  const palette = random.shuffle(random.pick(palettes));
  return ({ context, width, height, time }) => {
    // precalcs
    const origin = [width / 2, height / 2];
    // fill the bg
    context.fillStyle = palette[0];
    context.fillRect(0, 0, width, height)
    // draw spirals with all other colors in palette
    for (let i = 1; i < palette.length; i++) {
      const spiral = new Spiral({
        origin,
        context,
        n: NODES,
        color: palette[i + 1],
        step: THETA_STEP,
        width: THICKNESS,
        grow: GROW - (GROW_SPREAD * i),
      });
      spiral.draw(time * 0.01);
    }
  };
};

export { sketch, settings };
