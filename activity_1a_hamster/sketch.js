function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(255);
  noStroke();
  //head
  fill(248, 223, 146);
  ellipse(200, 200, 210, 230);
  //white cheeks
  fill(250);
  ellipse(130, 270, 100, 80);
  ellipse(270, 270, 100, 80);
  ellipse(200, 280, 120, 80);
  //left ear
  fill(248, 223, 146);
  ellipse(125, 125, 75, 75);
  //right ear
  fill(248, 223, 146);
  ellipse(275, 125, 75, 75);
  //top stripes
  fill(236, 168, 95);
  rect(175, 90, 20, 50, 10);
  rect(205, 90, 20, 50, 10);
  //inside ears
  fill(245, 198, 110);
  ellipse(125, 120, 40, 40);
  ellipse(275, 120, 40, 40);
  //eyes
  fill(0);
  ellipse(160, 205, 30, 50);
  ellipse(240, 205, 30, 50);
  //white eyes
  fill(255);
  ellipse(160, 195, 14, 24);
  ellipse(240, 195, 14, 24);
  //eyebrows
  fill(0);
  ellipse(160, 170, 20, 5);
  ellipse(240, 170, 20, 5);
  //blush
  fill(244, 206, 217);
  ellipse(125, 270, 40, 40);
  ellipse(275, 270, 40, 40);
  //nose
  fill(145, 90, 70);
  ellipse(200, 240, 30, 15);
  //mouth
  fill(180, 90, 90);
  ellipse(200, 280, 40, 50)
}
