let blossoms = [];

function setup() {
  createCanvas(720, 480).parent('canvas-host');
  for (let i = 0; i < 16; i++) blossoms.push(new Blossom(random(width), random(height)));
}

function draw() {
  background('#edf2ec');
  for (let i = 0; i < blossoms.length; i++) {
    blossoms[i].update();
    blossoms[i].show();
  }
}
class Blossom {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(14, 32);
    this.speed = random(0.4, 1.4);
    this.angle = random(TWO_PI);
    this.col = random(['#e8b0cb', '#c1b7dd', '#e9cf8f']);
  }
  update() {
    this.y -= this.speed;
    this.x += sin(this.angle) * 0.35;
    this.angle += 0.012;
    if (this.y < -40) this.y = height + 40;
    this.x = (this.x + width) % width;
  }
  show() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    noStroke();
    fill(this.col);
    for (let i = 0; i < 5; i++) {
      ellipse(0, -this.size / 2, this.size * 0.65, this.size);
      rotate(TWO_PI / 5);
    }
    fill('#fff4c4');
    circle(0, 0, this.size * 0.4);
    pop();
  }
}

function mousePressed() {
  if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
    if (blossoms.length < 80) blossoms.push(new Blossom(mouseX, mouseY));
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') blossoms = [];
}
