const random = require('canvas-sketch-util/random');
import palettes from '@eatspaint/jp-color-palette';

const settings = {
  dimensions: [ 2048, 2048 ]
};

const VARIANCE = random.rangeFloor(10, 100);
const LINE_WIDTH = 15;
const TWO_PI = Math.PI * 2;
const COUNT = random.rangeFloor(3, 30);
const Y_MARGIN = 0.3;
const CORNER_RADIUS = random.range(0.1, 0.5);
const X_SCALE = 0.5;

const randomVariance = () => random.range(-VARIANCE, VARIANCE);

class Corner {
  constructor(control1, intersect, control2) {
    this.p1 = this.midpoint(control1, intersect);
    this.intersect = intersect;
    this.p2 = this.midpoint(control2, intersect);
  }

  midpoint(a, b) {
    return [
      (a[0] + b[0]) / 2,
      (a[1] + b[1]) / 2,
    ]
  }

  startPoint() {
    return this.p1;
  }
  
  arcToArgs() {
    return [...this.intersect, ...this.p2];
  }
}

class Block {
  /**
   * @param {number} x Horizontal axis center
   * @param {number} y Vertical axis center
   * @param {number} widthRoot Basis for width of block
   * @param {number} heightRoot Basis for height of block
   * @param {*} context Drawing context (2D Canvas)
   * @param {string} fill Color code to be used for block fill
   */
  constructor({ x, y, widthRoot, heightRoot, context, fill }) {
    const height = heightRoot + randomVariance();
    const width = widthRoot + randomVariance();
    const center = [x + randomVariance(), y + randomVariance()];
    this.fill = fill;
    this.context = context;
    this.r = Math.abs(height / 2 * CORNER_RADIUS);
    this.initCorners(center, height, width);
    this.varyCorners();
    this.initControls();
  }

  /**
   * Creates recatngular corners
   * @param center [x, y] midpoint of the rect
   * @param height height of the rect
   * @param width width of the rect
   */
  initCorners(center, height, width) {
    const halfHeight = height / 2;
    const halfWidth = width / 2;
    const [x, y] = center;
    const x1 = x - halfWidth;
    const x2 = x + halfWidth;
    const y1 = y - halfHeight;
    const y2 = y + halfHeight;
    this.corners = [
      [x1, y1],
      [x2, y1],
      [x2, y2],
      [x1, y2],
    ];
  }

  /**
   * Randomly adjusts all existing [x,y] pairs in `this.corners`
   */
  varyCorners() {
    this.corners = this.corners.map(([x, y]) => (
      [x + randomVariance(), y + randomVariance()]
    ));
  }

  /**
   * Builds "control" tangent line information for arced corners, based on the [x,y] points in `this.corners`
   */
  initControls() {
    this.controls = [];
    for (let i = 0; i < this.corners.length; i++) {
      this.controls.push(new Corner(
        this.corners[i],
        this.corners[(i + 1) % (this.corners.length)],
        this.corners[(i + 2) % (this.corners.length)],
      ));
    }
  }

  /**
   * Draws debug graphics at each corner
   */
  debug() {
    const { context, corners } = this;
    context.fillStyle = '#ff0000';
    corners.forEach(([x, y]) => {
      context.beginPath();
      context.arc(x, y, 10, 0, TWO_PI);
      context.fill();
    });
  }

  /**
   * Draws the "block" (filled with `this.fill`), with arced corners (radius `this.r`) using `this.context`
   */
  draw() {
    const { context, controls, fill, r } = this;
    context.fillStyle = fill;
    context.lineWidth = LINE_WIDTH;
    context.beginPath();
    context.moveTo(...controls[0].startPoint());
    for (let i=0; i < controls.length; i++) {
      context.arcTo(...controls[i].arcToArgs(), r);
    }
    context.closePath();
    context.fill();
    context.stroke();
  }
}

const sketch = () => {
  return ({ context, width, height }) => {
    // init a palette, blocks arr, and set the stroke
    const palette = random.pick(palettes);
    const blocks = [];
    context.strokeStyle = '#333';

    // step to be used for spacing blocks
    const step = (height * (1 - Y_MARGIN)) / COUNT;

    // starting y value
    let yPosition = height * (0.5 * Y_MARGIN);
    for (let i = 0; i <= COUNT; i++) {
      blocks.push(new Block({
        x: width / 2,
        y: yPosition,
        widthRoot: width * X_SCALE,
        heightRoot: height / COUNT,
        fill: random.pick(palette),
        context,
      }));
      // move along y axis by step size
      yPosition += step;
    }

    // in a random order (causes more interesting overlapping), draw the blocks
    random.shuffle(blocks).forEach((block) => block.draw());
  };
};

export { sketch, settings };