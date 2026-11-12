// Activity 5a - Colliding Circles
let balls = [];

function setup() {
  createCanvas(720, 480).parent("canvas-host");
  makeBalls();
}

function makeBalls() {
  balls = [];
  balls.push(new Ball(180, 220, 80, 2, 1));
  balls.push(new Ball(540, 220, 80, -2, 1));
  balls.push(new Ball(360, 120, 60, 1, 2));
  balls.push(new Ball(360, 360, 60, -1, -2));
}

function draw() {
  background(238, 234, 244);

  // move the balls and reset their colours
  for (let i = 0; i < balls.length; i++) {
    balls[i].move();
    balls[i].touching = false;
  }

  // check each pair only once
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      let d = dist(balls[i].position.x, balls[i].position.y,
        balls[j].position.x, balls[j].position.y);
      let totalRadius = balls[i].size / 2 + balls[j].size / 2;
      if (d < totalRadius) {
        balls[i].touching = true;
        balls[j].touching = true;
      }
    }
  }

  for (let i = 0; i < balls.length; i++) {
    balls[i].show();
  }
}

class Ball {
  constructor(x, y, size, speedX, speedY) {
    this.position = createVector(x, y);
    this.speed = createVector(speedX, speedY);
    this.size = size;
    this.touching = false;
  }

  move() {
    this.position.add(this.speed);
    let r = this.size / 2;

    if (this.position.x < r || this.position.x > width - r) {
      this.speed.x = -this.speed.x;
      this.position.x = constrain(this.position.x, r, width - r);
    }
    if (this.position.y < r || this.position.y > height - r) {
      this.speed.y = -this.speed.y;
      this.position.y = constrain(this.position.y, r, height - r);
    }
  }

  show() {
    noStroke();
    if (this.touching) {
      fill(241, 189, 104);
    } else {
      fill(182, 178, 220);
    }
    circle(this.position.x, this.position.y, this.size);

    // small highlight
    fill(255, 240);
    circle(this.position.x - 12, this.position.y - 14, this.size / 5);
  }
}

function mousePressed() {
  makeBalls();
}
