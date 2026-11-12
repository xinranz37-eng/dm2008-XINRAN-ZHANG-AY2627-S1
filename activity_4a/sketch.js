let cookie;
const flavors = [{
  name: 'Vanilla',
  col: '#edc58f'
}, {
  name: 'Matcha',
  col: '#aec58c'
}, {
  name: 'Strawberry',
  col: '#e5a6ba'
}];

function setup() {
  createCanvas(720, 480).parent('canvas-host');
  cookie = new Cookie(width / 2, height / 2, 150, 0);
}

function draw() {
  background('#f4ecdf');
  fill('#fff9f0');
  noStroke();
  ellipse(width / 2, height / 2, 420, 350);
  cookie.move();
  cookie.show();
  fill('#635044');
  textAlign(CENTER);
  text(flavors[cookie.flavor].name, width / 2, 35);
}
class Cookie {
  constructor(x, y, size, flavor) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.flavor = flavor;
  }
  move() {
    if (keyIsDown(LEFT_ARROW)) this.x -= 3;
    if (keyIsDown(RIGHT_ARROW)) this.x += 3;
    if (keyIsDown(UP_ARROW)) this.y -= 3;
    if (keyIsDown(DOWN_ARROW)) this.y += 3;
    this.x = constrain(this.x, this.size / 2, width - this.size / 2);
    this.y = constrain(this.y, this.size / 2, height - this.size / 2);
  }
  changeFlavor() {
    this.flavor = (this.flavor + floor(random(1, flavors.length))) % flavors.length;
  }
  show() {
    push();
    translate(this.x, this.y);
    noStroke();
    fill('#d5bda2');
    circle(4, 7, this.size);
    fill(flavors[this.flavor].col);
    circle(0, 0, this.size);
    fill('#755344');
    // chocolate chips
    ellipse(-30, -25, 12, 9);
    ellipse(20, -35, 10, 12);
    ellipse(40, 5, 12, 8);
    ellipse(-5, 5, 10, 10);
    ellipse(-35, 25, 11, 8);
    ellipse(10, 40, 12, 9);
    ellipse(35, 35, 8, 10);
    pop();
  }
}

function mousePressed() {
  if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) cookie.changeFlavor();
}

function keyPressed() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW || keyCode === UP_ARROW || keyCode === DOWN_ARROW) return false;
}
