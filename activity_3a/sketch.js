let sizes = [50, 78, 60, 95, 68, 85];
let palette = ['#f3b9cd', '#f7d690', '#b9d9bc', '#c9c1e7'];

function setup() {
  createCanvas(720, 440).parent('canvas-host');
}

function draw() {
  background('#ece8f3');
  noStroke();
  fill('#fffaf1');
  rect(30, 310, 660, 18, 9);
  for (let i = 0; i < sizes.length; i++) {
    let x = (i + 1) * width / (sizes.length + 1);
    fill(palette[i % palette.length]);
    ellipse(x, 300 - sizes[i] / 2, sizes[i], sizes[i]);
    fill('#51475e');
    textAlign(CENTER);
    text(sizes[i], x, 355);
  }
  fill('#51475e');
  textAlign(LEFT);
  text('Array length: ' + sizes.length, 30, 40);
}

function mousePressed() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;
  for (let i = 0; i < sizes.length; i++) sizes[i] = floor(random(35, 100));
}

function keyPressed() {
  if (key === 'a' || key === 'A') {
    if (sizes.length < 9) sizes.push(floor(random(35, 100)));
  }
  if (key === 'd' || key === 'D') {
    if (sizes.length > 1) sizes.splice(sizes.length - 1, 1);
  }
  if (key === 'c' || key === 'C') palette.push(palette.shift());
}
