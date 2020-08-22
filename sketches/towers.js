// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");
import palettes from '@eatspaint/jp-color-palette';

const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");

const settings = {
  dimensions: [1080, 1080],
  // framerate: 24,
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl",
  duration: 4,
};

const vec3FromColor = (color) => {
  return new THREE.Vector3(color.r, color.g, color.b);
}

const mixColors = (color1, color2, mix) => {
  const mixVec = new THREE.Vector3()
  mixVec.lerpVectors(vec3FromColor(color1), vec3FromColor(color2), mix);
  return new THREE.Color(mixVec.x, mixVec.y, mixVec.z);
}

const sketch = ({ context, width, height }) => {
  const [bg, ...palette] = random.shuffle(random.pick(palettes));
  const COUNT = random.rangeFloor(5, 40);
  const SIZE_BASE = (width / COUNT) / Math.sqrt(2);
  const [xSize, ySize, zSize] = [SIZE_BASE, SIZE_BASE, SIZE_BASE];

  const PHASE_FREQUENCY = 1 / random.rangeFloor(1, 10);
  const SCALING = random.range(2, 30);

  const easing = (x) => {
    // https://easings.net/#easeOutBounce
    const n1 = 7.5625;
    const d1 = 2.75;

    if (x < 1 / d1) {
      return n1 * x * x;
    } else if (x < 2 / d1) {
      return n1 * (x -= 1.5 / d1) * x + 0.75;
    } else if (x < 2.5 / d1) {
      return n1 * (x -= 2.25 / d1) * x + 0.9375;
    } else {
      return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
  }

  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });

  renderer.setClearColor(bg, 1);

  const camera = new THREE.OrthographicCamera(width / -2, width / 2, height / -2, height / 2, 0, 10000);
  camera.position.set(1000, 1000, 1000);
  camera.lookAt(new THREE.Vector3());

  const controls = new THREE.OrbitControls(camera, context.canvas);
  const scene = new THREE.Scene();

  const geometry = new THREE.BoxGeometry(xSize, ySize, zSize);
  
  const lowColor = new THREE.Color(palette[0]);
  const highColor = new THREE.Color(palette[palette.length - 1]);
  const meshes = [];
  const xOffset = ((width / 2) / Math.sqrt(2)) - xSize / 2;
  const zOffset = ((width / 2) / Math.sqrt(2)) - zSize / 2;
  for ( let i = -5; i < COUNT + 5; i++) {
    const material = new THREE.MeshStandardMaterial({
      color: lowColor,
    });
    let mesh = new THREE.Mesh(geometry, material);
    mesh.translateX((-xSize * i) + xOffset);
    mesh.translateZ((zSize * i) - zOffset);
    scene.add(mesh);
    meshes.push(mesh);
  }

  // LIGHTS
  const ambient = new THREE.AmbientLight('#fff', 0.3);
  scene.add(ambient);
  const pointLight = new THREE.PointLight('#fff');
  pointLight.position.set(-10000, -14000, 12000);
  scene.add(pointLight);

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ playhead }) {
      meshes.forEach((mesh, i) => {
        let phase = i * PHASE_FREQUENCY;
        let phi = playhead * 2 * Math.PI;
        let pos = Math.sin(phase + phi);
        let ease = easing((pos * 0.5) + 0.5);
        
        mesh.material.color.set(mixColors(highColor, lowColor, ease));
        mesh.scale.y = 1 + (SCALING * ease);
        mesh.translateX(pos);
        mesh.translateZ(pos * 1.5);
      })
      controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose();
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);
