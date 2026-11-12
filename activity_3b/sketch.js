let variation = 0;

function setup() {
  createCanvas(720, 480).parent('canvas-host');
}

function draw() {
  background('#f9f2df');
  for (let y = 0; y < 3; y++)
    for (let x = 0; x < 4; x++) {
      drawFlower(95 + x * 175, 85 + y * 155, 0.65 + (x + y) % 3 * 0.16, (x - y) * 0.2 + variation * 0.35, ['#e8b8cf', '#b6d6bd', '#c4c0e6'][(x + y + variation) % 3]);
    }
}

function drawFlower(x, y, size, angle, col) {
  push();
  translate(x, y);
  rotate(angle);
  scale(size);
  noStroke();
  fill(col);
  for (let i = 0; i < 6; i++) {
    push();
    rotate(i * TWO_PI / 6);
    ellipse(0, -30, 32, 60);
    pop();
  }
  fill('#f4ce72');
  circle(0, 0, 30);
  fill('#5a4b4a');
  circle(-5, -2, 3);
  circle(5, -2, 3);
  pop();
}

function mousePressed() {
  if (mouseY >= 0 && mouseY < height) variation = (variation + 1) % 3;
}
