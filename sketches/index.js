const canvasSketch = require('canvas-sketch');
import * as blocky from './blocky';
// import * as chromaticWaving from './chromatic-waving';
import * as colorPaletteTest from './color-palette-test';
import * as degenerate from './degenerate';
import * as towers from './towers';
import * as trace from './trace';

const options = [
  blocky,
  // chromaticWaving,
  colorPaletteTest,
  degenerate,
  towers,
  trace,
];

const index = Math.floor(Math.random() * options.length);
console.log(index);
const option = options[index];
// const option = trace;

canvasSketch(option.sketch, option.settings);
