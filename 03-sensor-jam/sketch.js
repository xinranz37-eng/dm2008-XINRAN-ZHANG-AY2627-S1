let port; // Serial Communication port
let connectBtn;
let wasOpened = false; // tracks port state to update the button label

let sensorVal;

let circleSize = 200;
let flowerSpread = 0;
let targetSpread = 0;

// different stroke colour for each circle
let circleColors = [
  [254, 212, 255], // pink/red
  [255, 253, 191], // yellow
  [220, 255, 194], // green
  [204, 241, 255], // blue
  [225, 204, 255] // purple
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  port = createSerial(); // creates the Serial Port

  // Connection helpers
  connectBtn = createButton("Connect to Arduino");
  connectBtn.position(20, 20);
  connectBtn.mousePressed(connectBtnClick);
}

function draw() {
  background(247, 246, 240);

  updateConnectBtn();

  // Receive data from Arduino
  if (port.opened()) {
    sensorVal = port.readUntil("\n");

    // Only use data that has information
    if (sensorVal[0]) {

      // use float() to convert the data from string to number
      let val = float(sensorVal);

      // Ignore anything that isn't a number
      if (!isNaN(val)) {

        val = constrain(val, 5, 100);

        // closer = flower opens
        // farther = flower closes into one circle
        targetSpread = map(val, 5, 100, 120, 0);
      }
    }
  }

  // smoothly animate every frame
  flowerSpread = lerp(flowerSpread, targetSpread, 0.08);

  drawFlower();
}

function drawFlower() {
  noFill();
  strokeWeight(5);

  // draw 5 circles around the centre
  for (let i = 0; i < 5; i++) {

    let angle = TWO_PI / 5 * i - HALF_PI;

    let x = width / 2 + cos(angle) * flowerSpread;
    let y = height / 2 + sin(angle) * flowerSpread;

    // use a different colour for each circle
    stroke(
      circleColors[i][0],
      circleColors[i][1],
      circleColors[i][2]
    );

    ellipse(x, y, circleSize);
  }
}

// DO NOT REMOVE THIS FUNCTION
function connectBtnClick() {
  if (!port.opened()) {
    port.open(9600);
  } else {
    port.close();
  }
}

// Keeps the button in sync with the real port state
function updateConnectBtn() {
  let isOpened = port.opened();

  if (isOpened === wasOpened) return;

  wasOpened = isOpened;

  connectBtn.html(
    isOpened ? "Disconnect Arduino" : "Connect to Arduino"
  );

  if (isOpened) {
    connectBtn.addClass("connected");
  } else {
    connectBtn.removeClass("connected");
  }
}
