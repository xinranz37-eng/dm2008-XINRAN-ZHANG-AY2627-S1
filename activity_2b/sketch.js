// DM2008 — Activity 2b
// Pattern Making (40 min)
//
// Use a for loop to draw a repeating pattern of shapes.
// Add a condition to introduce variation, and one interaction that changes the rule.
//
// Stretch: try a second row, or turn your row into a 2D grid.
let numCircles = 8;
let circleX = [];
let circleY = [];
let circleColor = [];
let caught = [];
let turnedBlack = [];
let timer = [];
let rodX = 200;
let rodY = 20;
let stringLength = 0;
let fishing = false;

function setup() {
  createCanvas(400, 400);
  noStroke();

  // macaron colors
  let macaronColors = [
    color(255, 209, 220),
    // pink
    color(255, 236, 179),
    // yellow
    color(197, 225, 165),
    // mint
    color(216, 191, 216),
    // lavender
    color(255, 218, 185),
    // peach
    color(255, 209, 220)
    // pink again
  ];

  for (let i = 0; i < numCircles; i++) {
    circleX[i] = i * 60 + 25;
    circleY[i] = 200;
    circleColor[i] = macaronColors[i % macaronColors.length];
    caught[i] = false;
    turnedBlack[i] = false;
    timer[i] = 30;
  }
}

function draw() {
  background(174, 225, 249);

  // draw and move each circle
  for (let i = 0; i < numCircles; i++) {

    // move circle to the right
    circleX[i] = circleX[i] + 1;
    if (circleX[i] > width + 20) {
      circleX[i] = -20;
    }

    // pick the color to show
    if (turnedBlack[i])
      fill(0);
    else if (caught[i])
      fill(255, 0, 0);
    else {
      fill(circleColor[i]);
    }

    ellipse(circleX[i], circleY[i], 40, 40);


    if (caught[i] && !turnedBlack[i]) {
      timer[i] = timer[i] - 1;
      if (timer[i] <= 0) {
        turnedBlack[i] = true;
      }
    }
  }

  // grow the string while fishing
  if (fishing && stringLength < 380) {
    stringLength = stringLength + 4;
  }

  // the fishing and string 
  stroke(80);
  strokeWeight(4);
  line(rodX - 15, rodY, rodX + 15, rodY); // the rod
  line(rodX, rodY, rodX, rodY + stringLength); // the string
  noStroke();

  // string touches any circle
  let stringEndX = rodX;
  let stringEndY = rodY + stringLength;

  for (let i = 0; i < numCircles; i++) {
    if (!caught[i]) {
      let d = dist(stringEndX, stringEndY, circleX[i], circleY[i]);
      if (d < 20) {
        caught[i] = true;
        fishing = false; // stop growing once we catch one
      }
    }
  }
}

function mousePressed() {
  // click the rod to start fishing
  if (abs(mouseX - rodX) < 20 && mouseY < 40) {
    fishing = true;
    stringLength = 0;
  }
}
