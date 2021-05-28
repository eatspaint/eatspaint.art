const random = require('canvas-sketch-util/random');

const settings = {
  animate: true,
  duration: 6,
  loop: true,
  dimensions: [ 2048, 2048 ]
};

// CONSTANTS (RAND)
const ROWS = random.rangeFloor(5, 20);
const COLS = ROWS;
const X1_FREQ = random.rangeFloor(1, 10);
const Y1_FREQ = random.rangeFloor(1, 10);;
const X2_FREQ = random.rangeFloor(1, 10);;
const Y2_FREQ = random.rangeFloor(1, 10);;
const X3_FREQ = random.rangeFloor(1, 10);;
const Y3_FREQ = random.rangeFloor(1, 10);;
const EXP = random.range(0.3, 1.7);
const SPACE_SCALING = random.range(0.25, 0.5);
const DEAD_ZONE = 0.25;

// CONSTANTS (CALC)
const TWO_PI = Math.PI * 2;
const TWO_THIRD_PI = TWO_PI * (1 / 3);
const FOUR_THIRD_PI = TWO_PI * (2 / 3);

class Actor {
  constructor({ x, y, size }) {
    this.x = x;
    this.y = y;
    this.mod1 = 1;
    this.mod2 = 1;
    this.mod3 = 1;
    this.size = size;
  }

  drawCircle(context, offestDist, offsetAngle, color) {
    context.fillStyle = color;
    context.lineWidth = 5;
    context.beginPath();
    let dist = 1 - offestDist;
    dist = dist > DEAD_ZONE ? 0 : (dist - DEAD_ZONE) * 3;
    const xOffset = dist * Math.sin(offsetAngle) * this.size;
    const yOffset = dist * Math.cos(offsetAngle) * this.size;
    context.arc(
      this.x - xOffset,
      this.y - yOffset,
      this.size,
      0, TWO_PI
    );
    context.fill();
  }

  draw(context) {
    this.drawCircle(
      context, this.mod1, 0,
      'rgba(255, 0, 0, 1)'
    );
    this.drawCircle(
      context, this.mod2, TWO_THIRD_PI,
      'rgba(0, 0, 255, 1)'
    );
    this.drawCircle(
      context, this.mod3, FOUR_THIRD_PI,
      'rgba(0, 255, 0, 1)'
    );
  }
}

const dist = (x1, y1, x2, y2) => (
  Math.sqrt(
    ((x2 - x1) ** 2) + ((y2 - y1) ** 2)
  )
);

const sketch = () => {
  let items = [];
  return ({ context, width, height, playhead }) => {
    // SETUP HELPERS
    const xCenter = width * 0.5;
    const yCenter = height * 0.5;
    const maxDist = dist(0, 0, width, height);
    const radialPlayhead = playhead * TWO_PI;
    const norm = (n) => (maxDist - n) / maxDist;

    // CALCULATE "POINTER" POSITIONS
    const x1 = (Math.sin(radialPlayhead * X1_FREQ) * xCenter) + xCenter;
    const y1 = (Math.cos(radialPlayhead * Y1_FREQ) * yCenter) + yCenter;
    const x2 = (Math.sin(radialPlayhead * X2_FREQ) * xCenter) + xCenter;
    const y2 = (Math.cos(radialPlayhead * Y2_FREQ) * yCenter) + yCenter;
    const x3 = (Math.sin(radialPlayhead * X3_FREQ) * xCenter) + xCenter;
    const y3 = (Math.cos(radialPlayhead * Y3_FREQ) * yCenter) + yCenter;
    
    // CLEAR BG
    context.globalCompositeOperation = 'source-over';
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);
    
    // INIT ITEMS
    if (items.length === 0) {
      const xStep = width / ROWS;
      const yStep = height / COLS;
      for(let i = 0; i < COLS; i++) {
        for(let j = 0; j < ROWS; j++) {
          if (i === 0 && j % 2 === 0) {
            // offset rows need one fewer dot!
            continue 
          }
          const xPos = i * xStep + xStep * (j % 2 * 0.5); // offset every other row
          const yPos = j * yStep + yStep * 0.5;
          items.push(
            new Actor({
              x: xPos,
              y: yPos,
              size: xStep * SPACE_SCALING
            })
          )
        }
      }
    }

    // DRAW
    context.globalCompositeOperation = 'lighter'; // this causes color addition! e.g. R + G + B = W
    items.forEach(actor => {
      // distance from "pointer" normalized to 0..1
      actor.mod1 = norm(dist(actor.x, actor.y, x1, y1)) ** EXP;
      actor.mod2 = norm(dist(actor.x, actor.y, x2, y2)) ** EXP;
      actor.mod3 = norm(dist(actor.x, actor.y, x3, y3)) ** EXP;
      actor.draw(context);
    })
  };
};

export { sketch, settings };
