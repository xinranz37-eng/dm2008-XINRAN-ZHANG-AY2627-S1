// DM2008 — Activity 1b [Georg Nees]
// Learning By Making (30 min)

let x;
let y;
let w;
let c = 20;
let maxSize = 80;

function setup() {
  createCanvas(800, 800)
  background(148, 194, 255);
}

function draw() {

  x = random(width);
  y = random(height);
  w = random(10, maxSize);

  // background(240,40);

  stroke(255);
  strokeWeight(random(0.5, 1));
  fill(253, 191, 255);
  rect(x, y, w, w);
  rect(x, y, c, c);
  fill(210, 179, 252);
  stroke(0);
  strokeWeight(random(0.5, 1));
  ellipse(mouseX, mouseY, c, c);
}

function keyPressed() {
  maxSize = random(25, 200);
}

function mousePressed() {
  c = random(100, 255);
}
