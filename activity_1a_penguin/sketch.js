function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  noStroke();
  //head
  fill(36, 33, 34);
  ellipse(200, 120, 180, 160);
  //arms
  fill(36, 33, 34);
  ellipse(110, 200, 40, 100);
  ellipse(290, 200, 40, 100);
  //body
  fill(36, 33, 34);
  ellipse(200, 250, 200, 190)
  //face
  fill(255);
  ellipse(165, 140, 90, 100);
  ellipse(235, 140, 90, 100);
  ellipse(200, 170, 120, 60);
  //belly
  fill(255);
  ellipse(200, 250, 160, 190);
  //eyes
  fill(0);
  ellipse(170, 130, 20, 30);
  ellipse(230, 130, 20, 30);
  //mouth
  fill(252, 127, 18);
  triangle(180, 150, 220, 150, 200, 170);
  //feet
  fill(252, 127, 18);
  ellipse(160, 340, 60, 30);
  ellipse(240, 340, 60, 30)
}
