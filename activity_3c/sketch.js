let brushes = [dotBrush, flowerBrush, starBrush];
let selected = 0;
let ink = 0;
let palette = ['#d995b6', '#a9c8b3', '#aea1d0'];

function setup() {
  createCanvas(720, 480).parent('canvas-host');
  background('#fffaf0');
}

function draw() {
  if (mouseIsPressed && mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
    brushes[selected](mouseX, mouseY, 24, palette[ink]);
  }
}

function dotBrush(x, y, s, col) {
  push();
  translate(x, y);
  noStroke();
  fill(col);
  circle(0, 0, s);
  pop();
}

function flowerBrush(x, y, s, col) {
  push();
  translate(x, y);
  rotate(frameCount * 0.03);
  noStroke();
  fill(col);
  for (let i = 0; i < 5; i++) {
    ellipse(0, -s / 2, s / 2, s);
    rotate(TWO_PI / 5);
  }
  fill('#f8d77a');
  circle(0, 0, s / 2);
  pop();
}

function starBrush(x, y, s, col) {
  push();
  translate(x, y);
  rotate(frameCount * 0.02);
  noStroke();
  fill(col);
  beginShape();
  for (let i = 0; i < 10; i++) {
    let r = i % 2 === 0 ? s : s * 0.4;
    vertex(cos(i * PI / 5) * r, sin(i * PI / 5) * r);
  }
  endShape(CLOSE);
  pop();
}

function keyPressed() {
  if (key === '1') selected = 0;
  if (key === '2') selected = 1;
  if (key === '3') selected = 2;
  if (key === 'c' || key === 'C') ink = (ink + 1) % palette.length;
  if (key === 'r' || key === 'R') background('#fffaf0');
}
