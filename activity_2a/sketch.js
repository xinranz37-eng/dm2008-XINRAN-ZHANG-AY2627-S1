// DM2008 — Activity 2a [Guided]
// Mode Switch (20 min)
//
// Keys 1, 2, 3 switch between modes — each one changes the background color.
// Try extending each mode to also change the fill, size, or speed of the ellipse.
// Keep it simple: one clear change per mode that's easy to see on screen.
//
// Stretch: add a 4th mode, or make the ellipse change shape between modes.

let x = 0; // ellipse x-position
let size = 50; // ellipse size
let bgColor; // background color, changed by key presses

function setup() {
  createCanvas(400, 400);
  bgColor = color(179, 252, 229);
}

function draw() {
  background(bgColor);

  // --- Your if/else goes here ---
  // Try swapping this out for your own rule.
  if (mouseIsPressed) {
    fill(250, 112, 115); // red on click
  } else {
    fill(91, 252, 102);
  }

  // Draw the ellipse at its current position
  rect(x, height / 2, size, size);
  fill(27, 247, 42);
  triangle(x, height / 2 - size, x - size / 2, height / 2, x + size / 2, height / 2);

  // Move the ellipse
  x += 2;

  // Wrap around when it exits the right edge
  if (x > width + size / 2) {
    x = 0;
  }
}

// Keys 1, 2, 3 change the background color — this is your mode switch
function keyPressed() {
  switch (key) {
    case "1":
      bgColor = color(228, 255, 23);
      break; // yellow
    case "2":
      bgColor = color(251, 140, 255);
      break; // pink
    case "3":
      bgColor = color(100, 100, 200);
      break; // blue
    default:
      bgColor = color(220); // grey



  }
}
