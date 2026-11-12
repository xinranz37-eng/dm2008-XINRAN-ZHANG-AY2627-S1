let sizeSlider, countSlider, shapeSelect, paletteButton;
let paletteIndex = 0;
const palettes = [
  ['#deb0ca', '#b9cdb4', '#bab3dc'],
  ['#edb17f', '#e2c66d', '#b8c9cb'],
  ['#8caac0', '#d0b7d2', '#a3c9bf']
];

function setup() {
  createCanvas(720, 480).parent('canvas-host');
  let panel = createDiv().id('controls');
  let sizeLabel = createElement('label', 'Size ').parent(panel);
  sizeSlider = createSlider(15, 65, 36, 1).parent(sizeLabel);
  sizeSlider.attribute('aria-label', 'Flower size');
  let countLabel = createElement('label', 'Columns ').parent(panel);
  countSlider = createSlider(3, 9, 6, 1).parent(countLabel);
  countSlider.attribute('aria-label', 'Columns');
  shapeSelect = createSelect().parent(panel);
  shapeSelect.attribute('aria-label', 'Shape');
  shapeSelect.option('Flower');
  shapeSelect.option('Circle');
  shapeSelect.option('Square');
  paletteButton = createButton('Change palette').parent(panel);
  paletteButton.mousePressed(changePalette);
}

function draw() {
  background('#faf4e6');
  let n = countSlider.value(),
    s = sizeSlider.value();
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < n; col++) {
      push();
      translate((col + 0.5) * width / n, (row + 0.5) * height / 4);
      noStroke();
      fill(palettes[paletteIndex][(row + col) % 3]);
      let shape = shapeSelect.value();
      if (shape === 'Flower') {
        rotate(sin(frameCount * 0.015 + col) * 0.2);
        for (let i = 0; i < 5; i++) {
          ellipse(0, -s / 2, s * 0.55, s);
          rotate(TWO_PI / 5);
        }
        fill('#f7d681');
        circle(0, 0, s * 0.5);
      } else if (shape === 'Circle') {
        circle(0, 0, s * 1.5);
      } else {
        rectMode(CENTER);
        rect(0, 0, s * 1.3, s * 1.3, 5);
      }
      pop();
    }
}

function changePalette() {
  paletteIndex = paletteIndex + 1;
  if (paletteIndex >= palettes.length) {
    paletteIndex = 0;
  }
}
