// DM2008 — Mini Project

// DUCKY BIRD
// Flappy bird but ducky bird

// get chased by crocodile 
// press space to dive, n eat bread 🍞 
// colored fish = change duck color + speed boost 
// eat trash = slow down
// cannot hit into seaweed = get eaten = lose 

// Controls:
// HOLD SPACE = dive down
// RELEASE SPACE = float upward

// Upload the audio files listed in ASSETS.md, then change this to true.
// Leave it false to test the game before adding sound.
const USE_SOUND = false;

let backgroundMusic;
let breadSound;
let fishSound;
let trashSound;
let hitSound;
let gameOverSound;
let muted = false;

let bubbles = [];
let message = "";
let messageTimer = 0;

function preload() {
  if (USE_SOUND) {
    backgroundMusic = loadSound("assets/music.mp3");
    breadSound = loadSound("assets/bread.wav");
    fishSound = loadSound("assets/fish.wav");
    trashSound = loadSound("assets/trash.wav");
    hitSound = loadSound("assets/hit.wav");
    gameOverSound = loadSound("assets/gameover.wav");
  }
}

function startMusic() {
  if (USE_SOUND && !muted && !backgroundMusic.isPlaying()) {
    backgroundMusic.setVolume(0.2);
    backgroundMusic.loop();
  }
}

// This function avoids repeating the mute check for every sound.
function playGameSound(sound) {
  if (USE_SOUND && !muted) {
    sound.setVolume(0.5);
    sound.play();
  }
}

function showMessage(words) {
  message = words;
  messageTimer = 60;
} 

/* ----------------- Globals ----------------- */

let duck;
let crocodile;

let seaweeds = [];
let breads = [];
let fishes = [];
let trashItems = [];

let score = 0;
let lives = 3;

let spawnDistance = 0;
const GROUP_SPACING = 430;
let elapsedTime = 0;
let boostTimer = 0;

let spaceHeld = false;

let slowTimer = 0;
let invincibleTimer = 0;


const NORMAL_SPEED = 3;
const MAX_SPEED = 6;
let baseSpeed = NORMAL_SPEED;
let worldSpeed = NORMAL_SPEED;

// Game states
let gameState = "start";

/* ----------------- Setup & Draw ----------------- */

function setup() {
  createCanvas(900, 500);
  noStroke();
  frameRate(60);
  textFont("Trebuchet MS");

  for (let i = 0; i < 20; i++) {
    bubbles.push(new Bubble(random(width), random(height)));
  }

  duck = new Duck(250, height / 2);
  crocodile = new Crocodile(45, height / 2);

  // Start with the same kind of group used during the game.
  spawnGroup(width + 40);
}

function draw() {
  drawOcean();
  drawBubbles();

  if (gameState === "start") {
    crocodile.show();
    duck.show();
    drawStartScreen();
  }
  if (gameState === "playing") {

    updateSpeed();
    duck.update();

    if (invincibleTimer > 0) {
      invincibleTimer--;
    }

    // Spawn after the previous group has travelled far enough.
    // This keeps the spacing even during boosts and slowdowns.
    spawnDistance += worldSpeed;
    if (spawnDistance >= GROUP_SPACING) {
      spawnDistance -= GROUP_SPACING;
      spawnGroup(width + 40 - spawnDistance);
    }

    // seaweed
    for (
      let i = seaweeds.length - 1; i >= 0; i=i-1
    ) {

      seaweeds[i].update();
      seaweeds[i].show();

      if (
        invincibleTimer <= 0 &&
        seaweeds[i].hits(duck)
      ) {
        loseLife();
        seaweeds.splice(i, 1);
        continue;
      }
      
      if (seaweeds[i].offscreen()) {
        seaweeds.splice(i, 1);
      }
    }

    if (gameState === "gameover") return;

    // bread
    for (let i = breads.length - 1; i >= 0; i=i-1
    ) {
      breads[i].update();
      breads[i].show();

      if (breads[i].hits(duck)) {
        score++;
        playGameSound(breadSound);
        showMessage("Yum! +1 bread");
        // Push crocodile back
        crocodile.x = max(40, crocodile.x - 25);
        breads.splice(i, 1);
        continue;
      }

      if (breads[i].offscreen()) {
        breads.splice(i, 1);
      }
    }

    if (gameState === "gameover") return;

    // FISH
    for (
      let i = fishes.length - 1;i >= 0; i=i-1
    ) {

      fishes[i].update();
      fishes[i].show();

      if (fishes[i].hits(duck)) {
        duck.duckColor =
          fishes[i].fishColor;
        playGameSound(fishSound);
        boostTimer = 4;
        slowTimer = 0;
        showMessage("New colour + speed boost!");
        
        fishes.splice(i, 1);
        continue;
      }

      if (fishes[i].offscreen()) {
        fishes.splice(i, 1);
      }
    }

    // trash

    for (
      let i = trashItems.length - 1; i >= 0; i=i-1
    ) {

      trashItems[i].update();
      trashItems[i].show();
      if (trashItems[i].hits(duck)) {
        slowTimer = 180;
        boostTimer = 0;
        playGameSound(trashSound);
        showMessage("Oh no! Trash slows you down");

        // croc gets closer
        crocodile.x += 20;
        trashItems.splice(i, 1);
        continue;
      }

      if (trashItems[i].offscreen()) {
        trashItems.splice(i, 1);
      }
    }

    // croc
    crocodile.update(duck);
    crocodile.show();
    if (
      invincibleTimer <= 0 &&
      crocodile.hits(duck)
    ) {
      loseLife();
    }

    // duck
    duck.show();

    // ui
    drawScoreandLives();
  }

  // GAME OVER
  if (gameState === "gameover") {
    // still draw characters
    crocodile.show();
    duck.show();
    drawGameOver();
  }
}

// Every group has seaweed AND bread. Only the bonus item is random.
function spawnGroup(x) {
  let weed = new Seaweed(x);
  seaweeds.push(weed);

  let bread = new Bread(x + 15);
  let weedTop = height - 25 - weed.h;
  // Keep enough space for the duck between the bread and seaweed.
  bread.y = random(100, weedTop - 65);
  breads.push(bread);

  // Put bonus items halfway between groups, away from the seaweed.
  let choice = random(1);
  if (choice < 0.35) {
    fishes.push(new Fish(x + GROUP_SPACING / 2));
  } else if (choice < 0.60) {
    trashItems.push(new Trash(x + GROUP_SPACING / 2));
  }
}

function updateSpeed() {
  // deltaTime is the time since the previous frame, in milliseconds.
  // Limit it so switching browser tabs does not skip a lot of game time.
  let seconds = min(deltaTime, 100) / 1000;
  elapsedTime += seconds;

  // Add 0.025 each second: speed goes from 3 to 6 in two minutes.
  baseSpeed = min(MAX_SPEED, NORMAL_SPEED + elapsedTime * 0.025);
  worldSpeed = baseSpeed;

  if (boostTimer > 0) {
    boostTimer = max(0, boostTimer - seconds);
    if (boostTimer > 0) {
      worldSpeed += 1.5;
    }
  }

  if (slowTimer > 0) {
    slowTimer = max(0, slowTimer - seconds * 60);
    if (slowTimer > 0) {
      worldSpeed = baseSpeed * 0.5;
    }
  }
}

/* ----------------- Input ----------------- */

function keyPressed(event) {
  // Ignore a key repeating when it is held down.
  if (event && event.repeat) {
    return false;
  }

  if (USE_SOUND) {
    userStartAudio();
  }

  if (key === "m" || key === "M") {
    muted = !muted;
    if (USE_SOUND) {
      if (muted) {
        backgroundMusic.stop();
        breadSound.stop();
        fishSound.stop();
        trashSound.stop();
        hitSound.stop();
        gameOverSound.stop();
      } else if (gameState === "playing") {
        startMusic();
      }
    }
  }

  if (key === " ") {
    if (gameState === "start") {
      gameState = "playing";
      startMusic();
    }
    spaceHeld = true;
    return false;
  }

  if (gameState === "gameover" && (key === "r" || key === "R")) {
    restartGame();
    startMusic();
  }
}

function keyReleased() {
  if (key === " ") {
    spaceHeld = false;
    return false;
  }
}

// lose a life

function loseLife() {
  lives = lives-1;
  playGameSound(hitSound);
  showMessage("Ouch! Be careful");
  // make invincible for a bit 
  invincibleTimer = 120;
  // reset duck position
  duck.pos.y = height / 2;
  duck.vel.y = 0;
  // push crocodile back
  crocodile.x = max(40, crocodile.x - 100);
  // if no lives left
  if (lives <= 0) {
    gameState = "gameover";
    spaceHeld = false;
    if (USE_SOUND) {
      backgroundMusic.stop();
    }
    playGameSound(gameOverSound);
  }
}

// ocean
function drawOcean() {
  // Lots of horizontal lines make the water gradually darker.
  let topColour = color(125, 225, 220);
  let bottomColour = color(25, 100, 145);
  for (let y = 0; y < height; y++) {
    let waterColour = lerpColor(topColour, bottomColour, y / height);
    stroke(waterColour);
    line(0, y, width, y);
  }

  // Transparent shapes look like sunlight entering the water.
  noStroke();
  fill(255, 255, 220, 22);
  for (let x = 100; x < width; x += 240) {
    quad(x, 0, x + 65, 0, x - 40, height, x - 180, height);
  }

  // Hills in the distance.
  fill(30, 125, 145);
  for (let x = 0; x < width + 150; x += 180) {
    ellipse(x, height - 20, 260, 120);
  }

  noFill();
  stroke(255, 255, 255, 45);
  strokeWeight(2);
  for (let y = 50; y < height - 25; y += 65) {
    beginShape();
    for (let x = 0; x <= width; x += 20) {
      let wave = sin(frameCount * 0.025 + x * 0.025) * 5;
      vertex(x, y + wave);
    }
    endShape();
  }

  noStroke();
  fill(235, 211, 159);
  rect(0, height - 25, width, 25);
  fill(255, 231, 182);
  rect(0, height - 25, width, 4);
  fill(200, 174, 125);
  for (let x = 12; x < width; x += 35) {
    ellipse(x, height - 10, 5, 3);
  }
}

function drawBubbles() {
  for (let i = 0; i < bubbles.length; i++) {
    bubbles[i].update();
    bubbles[i].show();
  }
}

function drawStartScreen() {
  fill(10, 45, 65, 130);
  rect(0, 0, width, height);
  fill(255, 244, 211);
  rect(195, 100, 510, 295, 20);
  textAlign(CENTER);
  fill(35, 85, 95);
  textSize(48);
  text("DUCKY BIRD", width / 2, 167);
  textSize(18);
  text("Hold SPACE to dive. Release to float up.", width / 2, 213);
  text("Eat bread. Fish give colour and a speed boost!", width / 2, 250);
  text("Avoid seaweed, trash and the hungry crocodile.", width / 2, 282);
  fill(40, 130, 120);
  rect(310, 315, 280, 48, 12);
  fill(255);
  textSize(20);
  text("Press SPACE to start", width / 2, 346);
}

// ui

function drawScoreandLives() {
  noStroke();
  fill(15, 65, 85, 210);
  rect(15, 15, 235, 88, 15);
  fill(255, 234, 175);
  textAlign(LEFT);
  textSize(22);
  text("Bread: " + score, 30, 48);
  fill(255, 175, 165);
  text("Lives: " + lives, 30, 80);

  fill(255);
  textSize(14);
  text("Hold SPACE to dive | M to mute", 20, height - 40);

  if (slowTimer > 0) {
    fill(255, 217, 135);
    text("TRASH SLOWDOWN!", 20, 130);
    rect(20, 140, slowTimer, 6, 3);
  }

  if (boostTimer > 0) {
    fill(160, 255, 220);
    text("FISH SPEED BOOST!", 20, 130);
    rect(20, 140, boostTimer * 45, 6, 3);
  }

  textAlign(RIGHT);
  fill(255);
  textSize(14);
  text("Time: " + floor(elapsedTime) + "s", width - 20, 55);
  text("Speed: " + (worldSpeed / NORMAL_SPEED).toFixed(1) + "x", width - 20, 78);

  if (messageTimer > 0) {
    textAlign(CENTER);
    textSize(20);
    fill(255, 243, 190);
    text(message, width / 2, 55);
    messageTimer--;
  }

  textAlign(RIGHT);
  textSize(14);
  fill(255);
  if (!USE_SOUND) {
    text("Sound assets not added yet", width - 20, 30);
  } else if (muted) {
    text("Sound off", width - 20, 30);
  } else {
    text("Sound on", width - 20, 30);
  }
}

/* ----------------- Game Over ----------------- */

function drawGameOver() {

  fill( 0, 0, 0, 170);
  rect( 0, 0, width, height);
  textAlign(CENTER);
  fill(255);
  
  textSize(55);
  text("CHOMP!", width / 2, height / 2 - 60);
  
  textSize(25);
  text("The crocodile caught you!", width / 2, height / 2);

  text("Bread collected: " + score, width / 2, height / 2 + 45);

  textSize(18);
  text("Press R to restart", width / 2, height / 2 + 100);
}

// restart game

function restartGame() {
  score = 0;
  lives = 3;
  spawnDistance = 0;
  elapsedTime = 0;
  boostTimer = 0;
  baseSpeed = NORMAL_SPEED;
  slowTimer = 0;
  invincibleTimer = 0;
  worldSpeed = NORMAL_SPEED;
  spaceHeld = false;
  gameState = "playing";

  messageTimer = 0;

  // Reset duck
  duck = new Duck(250, height / 2);

  // Reset crocodile
  crocodile = new Crocodile(45, height / 2);

  // Empty arrays
  seaweeds = [];
  breads = [];
  fishes = [];
  trashItems = [];

  spawnGroup(width + 40);
}

// duck class

class Duck {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.r = 22;
    this.duckColor = color(255, 220, 40);
  }

  update() {
    // Fish makes both diving and floating faster for four seconds.
    let swimStrength = 1;
    if (boostTimer > 0) {
      swimStrength = 1.4;
    }

    // HOLD SPACE = dive
    if (spaceHeld) {
      this.vel.y += 0.3 * swimStrength;

    } else {
      // release Space = float upward
      this.vel.y -= 0.15 * swimStrength;
    }

    // water resistance
    this.vel.y *= 0.96;
    // move duck
    this.pos.y += this.vel.y;

    // keep inside canvas
    if (
      this.pos.y < this.r
    ) {
    this.pos.y = this.r;
      this.vel.y = 0;
    }

    if (this.pos.y > height - this.r - 25
    ) {

      this.pos.y = height - this.r - 25;
      this.vel.y = 0;
    }
  }

  show() {
    // make duck flash after being hit
    if (invincibleTimer > 0 &&
      floor(frameCount / 6) % 2 === 0
    ) {
      return;
    }
    push();
    translate(this.pos.x, this.pos.y);
    // Tilt a little when the duck swims up or down.
    rotate(this.vel.y * 0.04);
    noStroke();
    
    // my duck yay 
    fill(this.duckColor);
    ellipse(0, 5, 55, 38);
    ellipse(20, -10, 35, 35);
    
    fill(255, 150, 30);
    triangle(35, -10, 55, -4, 35, 2);

    fill(0);
    circle(25, -16, 5);

    // Flapping wing, a cheek and a little shine in the eye.
    fill(255, 200, 20);
    ellipse(-8, 5, 25, 16 + sin(frameCount * 0.2) * 4);
    fill(255, 165, 130);
    ellipse(28, -7, 8, 5);
    fill(255);
    circle(26, -17, 2);

    fill(255, 255, 255, 130);
    circle(-32, 0, 7);
    circle(-42, -8, 4);

    pop();
  }
}

// croc class

class Crocodile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 0.08;
  }

  update(duck) {
    // follow duck vertically
    this.y = lerp(this.y, duck.pos.y, 0.015);
    // slowly approach duck
    if (boostTimer > 0) {
      // The duck also gains some distance from the crocodile.
      this.x = max(40, this.x - 0.18);
    } else {
      this.x += this.speed * (baseSpeed / NORMAL_SPEED);
    }
  }

  hits(duck) {
    const crocodileMouth = this.x + 95;
    const duckLeft = duck.pos.x - duck.r;

    // The crocodile must also be close vertically to bite.
    return crocodileMouth > duckLeft && abs(this.y - duck.pos.y) < 45;
  }

  show() {
    push();
    translate(this.x, this.y);

    noStroke();

    // draw my crocococococo
    fill(50, 130, 60);
    triangle(-55, 0, -120, sin(frameCount * 0.08) * 15, -55, 23);

    fill(70, 160, 80);
    ellipse(0, 0, 130, 55);

    fill(85, 175, 90);
    rect(35, -15, 60, 30, 10);

    fill(255);
    circle(35, -22, 16);

    fill(0);
    circle(38, -22, 7);

    // Small scales along the back.
    fill(40, 120, 65);
    for (let x = -50; x < 20; x += 18) {
      triangle(x, -20, x + 8, -32, x + 16, -20);
    }

    // teef
    fill(255);
    for (
      let x = 45; x < 90; x += 14
    ) {

      triangle(x, 15, x + 8, 15, x + 4, 25);
    }
    
    pop();
  }
}

// seaweed class

class Seaweed {
  constructor(x) {

    this.x = x;
    this.w = 45;
    this.h = random(100, 230);
  }

  update() {
    this.x -= worldSpeed;
  }

  show() {
    stroke(30, 130, 60);
    strokeWeight(10);

    noFill();

    // Three seaweed strands
    for (
      let i = 0; i < 3; i++
    ) {

      beginShape();
      for (
        let y = 0; y < this.h; y += 15
      ) {
        let wave = sin(frameCount * 0.04 + y * 0.08 + i) * 10;
        vertex(this.x + i * 15 + wave, height - 25 - y);
      }
      
      endShape();
    }

    noStroke();
  }

  hits(duck) {
    let top = height - 25 - this.h;

    const withinX = duck.pos.x + duck.r > this.x - 15 && duck.pos.x - duck.r < this.x + this.w;

    const withinY = duck.pos.y + duck.r > top;

    return (withinX && withinY);
  }

  offscreen() {

    return (this.x + this.w < 0);
  }
}

// bread class

class Bread {
  constructor(x) {
    this.x = x;
    this.y = random(70, height - 100);
    this.r = 20;
  }

  update() {
    this.x -= worldSpeed;
  }

  show() {
    // A soft glow makes the bread easier to spot.
    noStroke();
    fill(255, 230, 140, 45);
    circle(this.x, this.y, 55 + sin(frameCount * 0.08) * 5);
    stroke(150, 100, 50);
    strokeWeight(3);

    fill(205, 150, 75);
    rect(this.x - 18, this.y - 15, 36, 30, 8);

    noStroke();

    fill(240, 190, 100);
    ellipse(this.x, this.y - 10, 32, 18);
  }

  hits(duck) {
    return (
      dist(duck.pos.x, duck.pos.y, this.x, this.y) < duck.r + this.r);
  }

  offscreen() {
    return (this.x + this.r < 0);
  }
}

// fish class

class Fish {
  constructor(x) {

    this.x = x;
    this.y = random(70, height - 100);
    this.r = 18;
    
    let colors = [
      color(255, 100, 100),
      color(100, 180, 255),
      color(180, 100, 255),
      color(100, 230, 150),
      color(255, 120, 210)
    ];

    this.fishColor =
      random(colors);
  }

  update() {
    this.x -=
      worldSpeed;
  }

  show() {
    noStroke();

    fill(this.fishColor);

    // draw my fish bloop bloop bloop
    ellipse(this.x, this.y, 35, 20);

    triangle(this.x - 15, this.y, this.x - 32, this.y - 13, this.x - 32, this.y + 13);

    fill(0);
    circle(this.x + 8, this.y - 3, 4);
  }

  hits(duck) {

    return (
      dist(duck.pos.x, duck.pos.y, this.x, this.y) < duck.r + this.r);
  }

  offscreen() {
    return (this.x + this.r < 0);
  }
}

// trash class

class Trash {

  constructor(x) {
    this.x = x;
    this.y = random(70, height - 100);
    this.r = 18;
  }

  update() {
    this.x -= worldSpeed;
  }

  show() {

    fill(120);
    stroke(60);
    strokeWeight(2);

    rect(this.x - 13, this.y - 16, 26, 32, 4);
    line(this.x - 16, this.y - 16, this.x + 16, this.y - 16);

    noStroke();
  }

  hits(duck) {
    return (
      dist(
        duck.pos.x, duck.pos.y, this.x, this.y) < duck.r + this.r);
  }

  offscreen() {
    return (this.x + this.r < 0);
  }
}

// Each bubble moves up, then starts again at the bottom.
class Bubble {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(4, 12);
    this.speed = random(0.3, 1);
  }

  update() {
    this.y -= this.speed;
    if (this.y < -10) {
      this.y = height;
      this.x = random(width);
    }
  }

  show() {
    noFill();
    stroke(220, 255, 255, 90);
    strokeWeight(1);
    circle(this.x, this.y, this.size);
    noStroke();
  }
}
