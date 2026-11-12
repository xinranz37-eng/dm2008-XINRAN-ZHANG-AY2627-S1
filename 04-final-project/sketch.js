// =====================================================
// PUDDING SQUISHY — COMPLETE ANNOTATED SKETCH
// =====================================================
// 15 squishes: mini puddings begin splitting off.
// Minis float for 30 seconds, then melt for 6 seconds.
// After 120 seconds idle with no minis: regenerate.
// Bruises and chocolate dents fade during recovery.
// At 100 total squishes: explode, then hold ending
// screen permanently until RESTART is clicked.

// 1. GLOBAL VARIABLES AND SETTINGS
let pudding;
let crumbs = [];
let miniSquishies = [];
let explosionPieces = [];

let soundEnabled = false;
let previousSoundIndex = -1;
let activeSound = null;
let audioContext = null;

const SPLIT_THRESHOLD = 15;
const EXPLOSION_THRESHOLD = 100;
const EXPLOSION_DURATION = 2.2;
const EXPLOSION_PARTICLE_COUNT = 135;
const RECOVERY_DELAY = 120;
const RECOVERY_SPEED = 0.7;
const MINI_MELT_START = 30;
const MINI_MELT_DURATION = 6;
const MIN_PUDDING_SIZE = 0.48;
const SHRINK_PER_PIECE = 0.025;

const soundPaths = [
  'assets/squish1.mp3',
  'assets/squish2.mp3',
  'assets/squish3.mp3',
  'assets/squish4.mp3',
  'assets/squish5.mp3',
  'assets/squish6.mp3',
  'assets/squish7.mp3',
  'assets/squish8.mp3',
  'assets/squish9.mp3'
];
const soundPool = [];

// 2. SETUP
function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
  textFont('sans-serif');
  pudding = new PuddingToy();

  // Prepare the nine recorded sound files.
  for (const path of soundPaths) {
    const audio = new Audio(path);
    audio.preload = 'auto';
    audio.volume = 0.65;
    soundPool.push(audio);
  }
}

// 3. MAIN ANIMATION LOOP
function draw() {
  // Cap frame time to maintain stable movement.
  const dt = Math.min(deltaTime / 1000, 0.05);
  background(255);

  // NEW: Permanent ending state.
  // Once ended, no physics, fragments or timers update.
  // Only the ending screen is drawn until RESTART.
  if (pudding.finaleState === 'ended') {
    drawExplosionScreen();
    return;
  }

  // NEW: Transition from explosion to permanent ending.
  // This transition happens only once.
  if (
    pudding.finaleState === 'exploding' &&
    pudding.explosionFinished()
  ) {
    pudding.finaleState = 'ended';
    drawExplosionScreen();
    return;
  }

  // Normal pudding animation stops after explosion.
  if (!pudding.exploded) {
    // Update mini squishies first so recovery can detect
    // when they have all finished melting.
    for (let i = miniSquishies.length - 1; i >= 0; i--) {
      miniSquishies[i].update(dt);
      if (miniSquishies[i].finished) {
        miniSquishies.splice(i, 1);
      }
    }

    pudding.update(dt);

    if (!pudding.exploded) {
      pudding.display();
      for (const mini of miniSquishies) mini.display();
    }
  }

  // Temporary particles.
  for (let i = crumbs.length - 1; i >= 0; i--) {
    crumbs[i].update(dt);
    if (crumbs[i].life <= 0) crumbs.splice(i, 1);
    else crumbs[i].display();
  }

  // Explosion fragments move only during the explosion.
  for (let i = explosionPieces.length - 1; i >= 0; i--) {
    explosionPieces[i].update(dt);
    if (explosionPieces[i].finished) {
      explosionPieces.splice(i, 1);
    } else {
      explosionPieces[i].display();
    }
  }

  drawUI();
  if (pudding.exploded) drawExplosionScreen();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// 4. MOUSE AND TOUCH CONTROLS
function mousePressed() {
  // NEW: Only the Restart button responds after explosion.
  if (pudding.exploded) {
    if (
      pudding.finaleState === 'ended' &&
      mouseX >= width / 2 - 85 &&
      mouseX <= width / 2 + 85 &&
      mouseY >= height / 2 + 65 &&
      mouseY <= height / 2 + 113
    ) {
      restartPudding();
    }
    return false;
  }

  // Normal Reset button.
  if (
    mouseX >= 20 && mouseX <= 110 &&
    mouseY >= 42 && mouseY <= 70
  ) {
    restartPudding();
    return false;
  }

  // Sound toggle button.
  if (
    mouseX >= 120 && mouseX <= 235 &&
    mouseY >= 42 && mouseY <= 70
  ) {
    soundEnabled = !soundEnabled;
    if (soundEnabled) startAudio();
    else stopRecordedSound();
    return false;
  }

  pudding.start(mouseX, mouseY);
  return false;
}

function mouseReleased() {
  if (!pudding.exploded) pudding.stop();
  return false;
}

function touchStarted() {
  return mousePressed();
}

function touchEnded() {
  return mouseReleased();
}

// 5. RESTART
function restartPudding() {
  // Clears everything and returns to the initial state.
  // The user's sound preference remains unchanged.
  crumbs = [];
  miniSquishies = [];
  explosionPieces = [];

  stopRecordedSound();
  previousSoundIndex = -1;

  // A new pudding starts in finaleState = 'normal'.
  pudding = new PuddingToy();
}

// 6. HELPERS
// Smooth interpolation used for physics and regeneration.
function easeTo(a, b, speed, dt) {
  return a + (b - a) * (1 - Math.exp(-speed * dt));
}

function safeNum(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

// Real elapsed time in seconds.
function secondsSince(timestamp) {
  return (performance.now() - timestamp) / 1000;
}

// 7. USER INTERFACE
function drawUI() {
  push();
  noStroke();

  textAlign(LEFT, TOP);
  fill('#665345');
  textSize(15);
  text('Squishes: ' + pudding.count, 20, 16);

  if (!pudding.exploded) {
    // Reset and sound buttons.
    fill('#f6f1eb');
    rect(20, 42, 90, 28, 8);
    rect(120, 42, 115, 28, 8);

    fill('#665345');
    textSize(12);
    text('Reset', 36, 49);
    text(
      'Sound: ' + (soundEnabled ? 'on' : 'off'),
      133, 49
    );

    // Mood and damage counters.
    textAlign(RIGHT, TOP);
    textSize(14);
    text(pudding.mood, width - 22, 18);

    fill('#918578');
    textSize(12);
    text(
      'Bruises: ' + pudding.bruises.length +
      ' · Chips: ' + pudding.chips.length +
      ' · Mini squishies: ' + miniSquishies.length,
      width - 22, 40
    );

    // Recovery status.
    if (
      pudding.cycleCount >= SPLIT_THRESHOLD ||
      pudding.recovering
    ) {
      let status = '';

      if (pudding.recovering) {
        status = 'Healing: ' +
          Math.round(pudding.recoveryProgress * 100) + '%';
      } else if (miniSquishies.length > 0) {
        status = 'Waiting for mini squishies to melt';
      } else {
        const remaining = Math.max(
          0,
          Math.ceil(pudding.recoveryDelay - pudding.idleTime)
        );
        status = 'Recovery in ' + remaining + 's';
      }

      fill('#a58a73');
      text(status, width - 22, 62);
    }

    // Pressure meter.
    const meterH = Math.min(190, height * 0.34);
    const meterY = height / 2 - meterH / 2;

    fill('#eee8df');
    rect(26, meterY, 11, meterH, 6);

    fill('#d7a169');
    rect(
      26,
      meterY + meterH * (1 - pudding.pressure),
      11,
      meterH * pudding.pressure,
      6
    );

    // Instructions.
    textAlign(CENTER, BOTTOM);
    fill('#938375');
    textSize(12);
    text(
      'Click anywhere · drag in any direction · hold to squeeze · tap quickly',
      width / 2, height - 23
    );

    // Temporary reaction text.
    if (pudding.messageTime > 0) {
      fill('#8f633c');
      textSize(17);
      textAlign(CENTER, CENTER);
      text(
        pudding.message,
        width / 2,
        Math.max(100, height * 0.2)
      );
    }
  }
  pop();
}

// =====================================================
// 8. MAIN PUDDING CLASS
// =====================================================
class PuddingToy {
  constructor() {
    // Counts: lifetime total and current splitting cycle.
    this.count = 0;
    this.cycleCount = 0;

    // Spring-damper physics.
    this.pressure = 0;
    this.squashAmount = 0;
    this.velocity = 0;
    this.softness = 0;
    this.memory = 0;

    // Damage.
    this.bruises = [];
    this.chips = [];

    // Mouse interaction.
    this.pressing = false;
    this.startX = 0;
    this.startY = 0;
    this.prevX = 0;
    this.prevY = 0;
    this.hitX = 0;
    this.hitY = 0;
    this.dragX = 0;
    this.dragY = 0;
    this.dirX = 0;
    this.dirY = 0;

    // Interaction history.
    this.time = 0;
    this.duration = 0;
    this.maxForce = 0;
    this.energy = 0;
    this.taps = [];
    this.spots = [];

    // Feedback.
    this.mood = 'Soft and bouncy';
    this.message = '';
    this.messageTime = 0;
    this.secret = false;
    this.chipCooldown = 0;

    // Size and splitting.
    this.currentSize = 1;
    this.totalShed = 0;

    // Facial expressions.
    this.reaction = 'excited';
    this.reactionTime = 0;

    // Regeneration.
    this.idleTime = 0;
    this.lastInteractionAt = performance.now();
    this.recovering = false;
    this.recoveryDelay = RECOVERY_DELAY;
    this.recoverySpeed = RECOVERY_SPEED;
    this.recoveryStartSize = 1;
    this.recoveryProgress = 0;

    // NEW: Three-stage finale system.
    // 'normal'    = normal squishing and regeneration
    // 'exploding' = explosion animation
    // 'ended'     = permanent ending until Restart
    this.exploded = false;
    this.finaleState = 'normal';
    this.explosionStartedAt = 0;
  }

  // 9. SIZE AND POSITION
  get scaleFactor() {
    return Math.max(
      0.5,
      Math.min(
        1.65,
        (width - 100) / 345,
        (height - 95) / 345
      )
    );
  }

  get cx() { return width / 2; }
  get cy() { return height / 2 + 30; }

  pieceScale() {
    // Each released mini reduces the main body by 2.5%.
    // The smallest allowed size is 48%.
    if (this.recovering) return 1;
    return Math.max(
      MIN_PUDDING_SIZE,
      1 - this.totalShed * SHRINK_PER_PIECE
    );
  }

  // 10. START SQUISHING
  start(x, y) {
    if (this.exploded) return;

    this.pressing = true;
    this.lastInteractionAt = performance.now();
    this.idleTime = 0;

    // A new press interrupts regeneration.
    this.recovering = false;
    this.recoveryProgress = 0;

    this.startX = x;
    this.startY = y;
    this.prevX = x;
    this.prevY = y;

    this.duration = 0;
    this.maxForce = 0;
    this.energy = 0;
    this.dragX = 0;
    this.dragY = 0;
    this.dirX = 0;
    this.dirY = 0;
    this.reactionTime = 0;

    // Convert mouse position into pudding coordinates.
    const lx =
      (x - this.cx) / (this.scaleFactor * this.currentSize);
    const ly =
      (y - this.cy) / (this.scaleFactor * this.currentSize);

    this.hitX = constrain(lx, -85, 85);
    this.hitY = constrain(ly, -35, 82);
  }

  // 11. PHYSICS AND REGENERATION
  update(dt) {
    if (this.exploded) return;

    this.time += dt;
    this.messageTime = Math.max(0, this.messageTime - dt);
    this.reactionTime = Math.max(0, this.reactionTime - dt);
    this.chipCooldown = Math.max(0, this.chipCooldown - dt);

    // Real-time inactivity timer, independent of frame rate.
    const now = performance.now();
    this.idleTime = this.pressing
      ? 0
      : (now - this.lastInteractionAt) / 1000;

    // Regenerate only when no minis remain, 15 squishes
    // were reached and 120 seconds of idle time passed.
    if (
      this.cycleCount >= SPLIT_THRESHOLD &&
      miniSquishies.length === 0 &&
      this.idleTime >= this.recoveryDelay &&
      !this.recovering &&
      !this.pressing
    ) {
      this.recovering = true;
      this.recoveryStartSize = this.currentSize;
      this.recoveryProgress = 0;

      this.mood = 'Recovering';
      this.reaction = 'happy';
      this.reactionTime = 5;
      this.say('The pudding is growing back!', 3);
    }

    // Smoothly move towards the current target size.
    this.currentSize = easeTo(
      this.currentSize,
      this.pieceScale(),
      this.recovering ? this.recoverySpeed : 3.5,
      dt
    );

    // Damage fades by the same percentage as size recovery.
    this.recoveryProgress = this.recovering
      ? constrain(
          (this.currentSize - this.recoveryStartSize) /
          Math.max(0.001, 1 - this.recoveryStartSize),
          0, 1
        )
      : 0;

    // Complete regeneration when 99.5% restored.
    if (this.recovering && this.currentSize >= 0.995) {
      this.currentSize = 1;
      this.totalShed = 0;
      this.cycleCount = 0;
      this.recovering = false;

      this.lastInteractionAt = performance.now();
      this.idleTime = 0;

      // Clear all damage and retained deformation.
      this.bruises = [];
      this.chips = [];
      this.softness = 0;
      this.memory = 0;
      this.taps = [];
      this.spots = [];
      this.secret = false;

      this.mood = 'Good as new!';
      this.reaction = 'happy';
      this.reactionTime = 3;
      this.say('All better again!', 3);
      this.recoveryProgress = 0;

      // this.count is not reset: still counting towards 100.
    }

    let target = 0;

    if (this.pressing) {
      this.duration += dt;

      // Drag distance from original press.
      const dx = safeNum(mouseX - this.startX);
      const dy = safeNum(mouseY - this.startY);
      const dragMag = Math.hypot(dx, dy);

      // Movement since previous frame.
      const stepX = safeNum(mouseX - this.prevX);
      const stepY = safeNum(mouseY - this.prevY);
      const stepMag = Math.hypot(stepX, stepY);

      if (stepMag > 0.4) {
        this.dirX = easeTo(
          this.dirX, stepX / stepMag, 13, dt
        );
        this.dirY = easeTo(
          this.dirY, stepY / stepMag, 13, dt
        );
      }

      this.prevX = mouseX;
      this.prevY = mouseY;

      // More dragging and longer holding increase pressure.
      target = constrain(
        0.14 + dragMag / 175 +
        Math.min(0.2, this.duration * 0.08),
        0.14, 1
      );

      this.dragX = easeTo(
        this.dragX,
        constrain(dx / (160 * this.scaleFactor), -1, 1),
        12, dt
      );

      this.dragY = easeTo(
        this.dragY,
        constrain(dy / (160 * this.scaleFactor), -1, 1),
        12, dt
      );

      this.maxForce = Math.max(this.maxForce, target);
      this.energy += target * dt;

      // Damage thresholds.
      if (target > 0.64 && this.duration > 0.25) {
        this.addBruise(dt, target);
      }

      if (
        target > 0.82 &&
        this.energy > 0.65 &&
        this.chipCooldown <= 0
      ) {
        this.makeChip();
      }
    } else {
      // Directional deformation fades after release.
      this.dragX = easeTo(this.dragX, 0, 3, dt);
      this.dragY = easeTo(this.dragY, 0, 3, dt);
      this.dirX = easeTo(this.dirX, 0, 3, dt);
      this.dirY = easeTo(this.dirY, 0, 3, dt);
    }

    // Spring-damper system creates elastic rebound.
    this.pressure = easeTo(this.pressure, target, 12, dt);

    const desired =
      this.pressure * (0.24 + this.softness * 0.22) +
      this.memory;

    const spring = (desired - this.squashAmount) * 125;
    const damping = this.pressing ? 16 : 6;

    this.velocity +=
      (spring - this.velocity * damping) * dt;

    this.squashAmount += this.velocity * dt;
    this.squashAmount = constrain(
      safeNum(this.squashAmount), -0.06, 0.55
    );
    this.velocity = safeNum(this.velocity);
  }

  // 12. BRUISE CREATION
  addBruise(dt, force) {
    const bx = this.hitX + this.dragX * 14;
    const by = this.hitY + this.dragY * 10;

    // Strong pressure enlarges existing nearby bruises.
    let bruise = this.bruises.find(
      b => Math.hypot(b.x - bx, b.y - by) < 24
    );

    if (!bruise) {
      bruise = {
        x: bx,
        y: by,
        radius: 8,
        alpha: 0.28
      };

      this.bruises.push(bruise);
      if (this.bruises.length > 15) this.bruises.shift();
      this.say('A little bruise...');
    }

    bruise.radius = Math.min(
      24, bruise.radius + dt * 10 * force
    );
    bruise.alpha = Math.min(
      0.68, bruise.alpha + dt * 0.15
    );
  }

  // 13. CHOCOLATE DAMAGE
  makeChip() {
    const chipX = constrain(
      this.hitX + this.dragX * 14, -72, 72
    );

    // Prevent dents that overlap an existing one.
    if (
      this.chips.some(
        c => Math.abs(c.x - chipX) < 18
      )
    ) return;

    this.chips.push({
      x: chipX,
      width: random(8, 13),
      depth: random(3, 5)
    });

    this.chipCooldown = 0.8;
    this.say('The chocolate softened a little!');

    emitCrumbs(
      this.cx + chipX * this.scaleFactor * this.currentSize,
      this.cy - 59 * this.scaleFactor * this.currentSize,
      6, 'chip'
    );

    playSpecialSound('chip');
  }

  // 14. MINI SQUISHY GENERATION
  shedMiniSquishies(amount) {
    for (
      let i = 0;
      i < amount && miniSquishies.length < 24;
      i++
    ) {
      const side = this.totalShed % 2 === 0 ? 1 : -1;
      const scaleNow = this.scaleFactor * this.currentSize;

      const bornX = this.cx + side * 110 * scaleNow;
      const bornY = this.cy + random(-20, 55) * scaleNow;
      const radius = random(11, 18) * this.scaleFactor;

      miniSquishies.push(
        new MiniSquishy(bornX, bornY, radius, side)
      );

      // Each released mini reduces the main pudding's size.
      this.totalShed++;
      emitCrumbs(bornX, bornY, 6, 'spark');
    }
  }

  // 15. END SQUISHING
  stop() {
    if (!this.pressing || this.exploded) return;

    this.pressing = false;
    this.count++;
    this.cycleCount++;

    this.lastInteractionAt = performance.now();
    this.idleTime = 0;

    this.velocity -= this.maxForce * 1.85;
    playRandomSquish();

    // NEW: The 100th squish triggers the finale.
    // It overrides normal splitting and reactions.
    if (this.count >= EXPLOSION_THRESHOLD) {
      this.explode();
      return;
    }

    // Split 1–4 mini puddings after 15 squishes per cycle.
    if (this.cycleCount >= SPLIT_THRESHOLD) {
      this.shedMiniSquishies(Math.floor(random(1, 5)));
    }

    // Quick tap and Easter egg detection.
    const quickTap =
      this.duration < 0.23 &&
      this.maxForce < 0.35;

    this.spots.push({
      x: this.hitX,
      time: this.time
    });

    this.spots = this.spots.filter(
      s => this.time - s.time < 5
    );

    if (quickTap) {
      this.taps.push(this.time);
      this.taps = this.taps.filter(
        t => this.time - t < 3
      );

      emitCrumbs(
        this.cx + this.hitX * this.scaleFactor * this.currentSize,
        this.cy + this.hitY * this.scaleFactor * this.currentSize,
        5, 'spark'
      );

      if (this.taps.length >= 5 && !this.secret) {
        this.secret = true;
        this.say('SECRET: THE PUDDING IS ALIVE!', 3);
        emitCrumbs(this.cx, this.cy - 20, 42, 'star');
        playSpecialSound('secret');
      } else {
        this.say('Boop!');
      }

      this.reaction = 'happy';
      this.reactionTime = 0.8;

    } else if (this.maxForce > 0.65) {
      this.softness = Math.min(
        0.8, this.softness + 0.035
      );
      this.memory = Math.min(
        0.12, this.memory + 0.008
      );

      this.say(
        this.maxForce > 0.83 ? 'That was a lot!' : 'Ouch...'
      );
      this.reaction = 'hurt';
      this.reactionTime = 1.3;

    } else {
      this.say('Jiggle!');
      this.reaction = 'happy';
      this.reactionTime = 0.9;
    }

    // Repeated local pressure damages the chocolate.
    const sameZone = this.spots.filter(
      s => Math.abs(s.x - this.hitX) < 22
    );

    if (
      sameZone.length >= 4 &&
      !this.chips.some(
        c => Math.abs(c.x - this.hitX) < 18
      )
    ) {
      this.makeChip();
    }

    if (this.cycleCount === SPLIT_THRESHOLD) {
      this.say(
        'Little pudding pieces are floating away!', 2.7
      );
      playSpecialSound('secret');
      this.reaction = 'shocked';
      this.reactionTime = 2.5;
    }

    this.mood =
      this.cycleCount >= SPLIT_THRESHOLD ? 'Breaking apart' :
      this.bruises.length >= 4 ? 'Bruised' :
      this.secret ? 'Awake' :
      this.softness > 0.2 ? 'Worn in' :
      'Soft and bouncy';
  }

  // 16. NEW: EXPLOSION TRIGGER
  explode() {
    if (this.exploded) return;

    // Lock interaction and switch to explosion stage.
    this.exploded = true;
    this.finaleState = 'exploding';
    this.explosionStartedAt = performance.now();
    this.pressing = false;
    this.recovering = false;
    this.pressure = 0;
    this.mood = 'Exploded!';

    // The explosion replaces the remaining mini puddings.
    miniSquishies = [];

    const scaleNow =
      this.scaleFactor * this.currentSize;

    for (let i = 0; i < EXPLOSION_PARTICLE_COUNT; i++) {
      explosionPieces.push(
        new ExplosionPiece(
          this.cx + random(-40, 40) * scaleNow,
          this.cy + random(-35, 45) * scaleNow,
          scaleNow
        )
      );
    }

    emitCrumbs(this.cx, this.cy, 45, 'star');
    playExplosionSound();
  }

  // Checks the animation duration; does not reset anything.
  explosionFinished() {
    return (
      this.exploded &&
      secondsSince(this.explosionStartedAt) >= EXPLOSION_DURATION
    );
  }

  say(message, seconds = 1.3) {
    this.message = message;
    this.messageTime = seconds;
  }

  // 17. FACIAL EXPRESSION SELECTION
  getExpression() {
    if (this.pressing) {
      if (this.pressure > 0.58) return 'hurt';
      if (this.pressure > 0.12) return 'happy';
    }

    if (this.reactionTime > 0) return this.reaction;
    if (this.recovering) return 'happy';
    if (this.cycleCount >= SPLIT_THRESHOLD) return 'shocked';
    if (this.bruises.length >= 3) return 'sad';

    return 'excited';
  }

  // 18. PROCEDURAL BODY GEOMETRY
  bodyPoint(angle) {
    const theta = safeNum(angle);
    const cosine = Math.cos(theta);
    const sine = Math.sin(theta);

    // Base flan-like outline.
    let x =
      115 * Math.sign(cosine) *
      Math.pow(Math.abs(cosine), 0.98);

    let y =
      25 + 110 * Math.sign(sine) *
      Math.pow(Math.abs(sine), 0.6);

    const bottom = Math.pow(Math.max(0, sine), 1.35);
    const top = Math.pow(Math.max(0, -sine), 1.5);

    // Widen the bottom.
    x *= 1 + 0.45 * bottom;
    y += 6 * top;

    const squash = safeNum(this.squashAmount);
    const pressure = safeNum(this.pressure);

    // Wobble and deformation.
    x += bottom * squash * 12 *
      Math.sin(3 * theta + this.time * 7);

    y += bottom * squash * 6 *
      Math.sin(4 * theta + this.time * 7);

    const influence =
      0.24 + 0.76 * Math.max(0, 1 - Math.abs(y) / 120);

    x += (
      safeNum(this.dragX) * 12 +
      safeNum(this.dirX) * 11
    ) * pressure * influence;

    y += (
      safeNum(this.dragY) * 8 +
      safeNum(this.dirY) * 8
    ) * pressure * influence;

    // Subtle upper-body indentation.
    if (y < 0) {
      const topBlend = Math.pow(
        Math.max(0, 1 - Math.pow(x / 92, 2)), 2
      );
      y += topBlend * pressure * 15;
    }

    return { x: safeNum(x), y: safeNum(y) };
  }

  bodyVertices() {
    const points = [];
    for (let i = 0; i < 200; i++) {
      points.push(this.bodyPoint(TWO_PI * i / 200));
    }
    return points;
  }

  drawPolygon(points) {
    beginShape();
    for (const point of points) {
      vertex(safeNum(point.x), safeNum(point.y));
    }
    endShape(CLOSE);
  }

  // 19. CHOCOLATE TOPPING
  drawChocolateTop() {
    push();
    noStroke();

    fill('#8c4b35');
    beginShape();

    // Upper edge.
    for (let i = 0; i <= 80; i++) {
      const x = -99 + (i / 80) * 198;
      const y = -54 - 21 *
        Math.sqrt(Math.max(0, 1 - (x / 100) ** 2));
      vertex(x, y);
    }

    // Lower chocolate edge.
    for (let i = 80; i >= 0; i--) {
      const x = -99 + (i / 80) * 198;
      const curve = Math.sqrt(
        Math.max(0, 1 - (x / 104) ** 2)
      );
      vertex(
        x,
        -40 + 4 * curve + 1.5 * Math.cos(x * 0.085)
      );
    }
    endShape(CLOSE);

    // Lighter upper chocolate surface.
    fill('#aa674e');
    beginShape();

    for (let i = 0; i < 120; i++) {
      const a = TWO_PI * i / 120;
      const wave = 1 + 0.02 * Math.cos(6 * a);
      vertex(
        Math.cos(a) * 95 * wave,
        -64 + Math.sin(a) * 12 * wave
      );
    }
    endShape(CLOSE);

    fill('#cb9274');
    ellipse(-15, -71, 100, 11);
    pop();
  }

  // 20. CHOCOLATE DAMAGE
  drawChocolateDamage() {
    push();
    noStroke();

    // Fade dents while the pudding grows back.
    drawingContext.globalAlpha *=
      1 - this.recoveryProgress;

    for (const chip of this.chips) {
      const x = chip.x;
      const y = -62;
      const w = chip.width * 1.55;

      fill(102, 49, 34, 48);
      ellipse(x, y, w + 8, chip.depth + 6);

      fill(112, 58, 43, 80);
      ellipse(x, y, w, chip.depth + 2);

      fill(243, 196, 163, 65);
      ellipse(x - 2, y - 2, w * 0.65, 2.5);
    }
    pop();
  }

  // 21. WHIPPED CREAM
  drawCream() {
    push();
    noStroke();

    fill('#e5ded5');
    ellipse(0, -78, 87, 27);

    fill('#f8f5ef');
    ellipse(-20, -85, 42, 29);
    ellipse(19, -85, 42, 29);
    ellipse(0, -91, 68, 29);
    ellipse(0, -99, 43, 22);

    fill(255, 255, 255, 130);
    ellipse(-11, -97, 22, 9);
    pop();
  }

  // 22. CHERRY
  drawCherry() {
    push();

    stroke('#98182f');
    strokeWeight(4);
    strokeCap(ROUND);
    noFill();
    bezier(3, -115, 14, -142, 35, -155, 53, -164);

    noStroke();
    fill('#ba2438');
    ellipse(8, -118, 34, 32);

    fill('#e64550');
    ellipse(5, -121, 30, 29);

    fill('#ff8991');
    ellipse(-1, -129, 10, 7);

    fill(255, 255, 255, 90);
    ellipse(-3, -131, 5, 4);
    pop();
  }

  // 23. GLOSSY HIGHLIGHTS
  drawHighlights() {
    push();
    noStroke();

    fill(255, 255, 255, 46);
    ellipse(-78, 7, 18, 45);

    fill(255, 255, 255, 22);
    ellipse(-80, 7, 7, 32);
    ellipse(70, 26, 12, 28);
    pop();
  }

  // 24. FIVE FACIAL EXPRESSIONS
  drawFace() {
    const expression = this.getExpression();

    push();
    stroke('#5c251d');
    strokeWeight(5);
    strokeCap(ROUND);
    strokeJoin(ROUND);
    noFill();

    if (expression === 'excited') {
      // Original >o< expression.
      line(-43, 12, -27, 21);
      line(-27, 21, -43, 30);
      line(43, 12, 27, 21);
      line(27, 21, 43, 30);

      noStroke();
      fill('#5c251d');
      ellipse(0, 29, 27, 31);
      fill('#f29fac');
      ellipse(0, 29, 19, 23);
      fill('#ffd6dd');
      ellipse(0, 36, 12, 7);

    } else if (expression === 'happy') {
      // Smiling eyes and cheeks.
      arc(-34, 19, 27, 23, PI, TWO_PI);
      arc(34, 19, 27, 23, PI, TWO_PI);

      noStroke();
      fill('#f7a7a3');
      ellipse(-60, 31, 17, 8);
      ellipse(60, 31, 17, 8);

      fill('#5c251d');
      arc(0, 27, 29, 25, 0, PI, CHORD);

      fill('#f29fac');
      ellipse(0, 34, 12, 6);

    } else if (expression === 'hurt') {
      // Scrunched eyes.
      line(-47, 12, -28, 23);
      line(-28, 23, -45, 31);
      line(47, 12, 28, 23);
      line(28, 23, 45, 31);

      noStroke();
      fill('#5c251d');
      ellipse(0, 34, 27, 18);
      fill('#f29fac');
      ellipse(0, 37, 19, 9);

      stroke('#5c251d');
      strokeWeight(2);
      noFill();
      line(-48, 5, -30, 10);
      line(48, 5, 30, 10);

    } else if (expression === 'sad') {
      // Sad eyes, eyebrows and tears.
      noStroke();
      fill('#5c251d');
      ellipse(-34, 22, 10, 15);
      ellipse(34, 22, 10, 15);

      stroke('#5c251d');
      strokeWeight(3);
      noFill();
      line(-45, 10, -28, 15);
      line(45, 10, 28, 15);
      arc(0, 43, 25, 18, PI, TWO_PI);

      noStroke();
      fill(133, 190, 235, 180);
      ellipse(-45, 43, 7, 14);
      ellipse(45, 43, 7, 14);

    } else if (expression === 'shocked') {
      // Shocked after the first fragmentation.
      noStroke();
      fill('#5c251d');
      ellipse(-36, 18, 16, 24);
      ellipse(36, 18, 16, 24);

      fill('#ffffff');
      ellipse(-39, 12, 5, 7);
      ellipse(33, 12, 5, 7);

      fill('#5c251d');
      ellipse(0, 37, 24, 31);

      fill('#f29fac');
      ellipse(0, 43, 14, 12);

      stroke('#5c251d');
      strokeWeight(3);
      noFill();
      arc(-36, 2, 23, 12, PI, TWO_PI);
      arc(36, 2, 23, 12, PI, TWO_PI);
    }
    pop();
  }

  // 25. BODY RIDGES
  drawBodyRidges() {
    push();
    stroke(255, 255, 255, 27);
    strokeWeight(2.5);
    noFill();

    for (let x = -52; x <= 52; x += 26) {
      bezier(
        x, -40,
        x - 8, -3,
        x - 4, 46,
        x + 5, 96
      );
    }
    pop();
  }

  // 26. DRAW MAIN PUDDING
  display() {
    if (this.exploded) return;

    const scaleAmount =
      safeNum(this.scaleFactor, 1) * this.currentSize;

    const deformation = constrain(
      safeNum(this.squashAmount), -0.06, 0.55
    );

    // Ground shadow.
    push();
    translate(this.cx, this.cy + 110 * scaleAmount);
    scale(scaleAmount);
    noStroke();
    fill(0, 0, 0, 12);
    ellipse(0, 0, 230, 24);
    pop();

    push();

    // Drag, squash and rotation transformations.
    translate(
      this.cx +
        (this.dragX * 26 + this.dirX * 7) *
        this.pressure * scaleAmount,
      this.cy +
        (this.dragY * 26 + this.dirY * 7) *
        this.pressure * scaleAmount
    );

    scale(
      scaleAmount / Math.sqrt(1 - deformation),
      scaleAmount * (1 - deformation)
    );

    rotate(
      (this.dragX - this.dragY * 0.35) *
      this.pressure * 0.16
    );

    const ctx = drawingContext;
    const points = this.bodyVertices();

    noStroke();
    fill('#f4cf59');
    this.drawPolygon(points);

    // Clip gradient and bruises to the body.
    ctx.save();
    ctx.beginPath();

    for (let i = 0; i < points.length; i++) {
      if (i === 0) {
        ctx.moveTo(points[i].x, points[i].y);
      } else {
        ctx.lineTo(points[i].x, points[i].y);
      }
    }
    ctx.closePath();
    ctx.clip();

    // Soft radial lighting.
    const gradient = ctx.createRadialGradient(
      -28, -24, 12, 10, 14, 170
    );

    gradient.addColorStop(
      0, this.secret ? '#fff2a8' : '#fee57f'
    );
    gradient.addColorStop(0.55, '#f8d65d');
    gradient.addColorStop(1, '#efc84f');

    ctx.fillStyle = gradient;
    ctx.fillRect(-180, -135, 360, 300);

    this.drawBodyRidges();

    // Fade bruises as the main pudding regenerates.
    const healingOpacity = 1 - this.recoveryProgress;

    for (const bruise of this.bruises) {
      for (let j = 3; j >= 1; j--) {
        fill(
          156, 92, 139,
          bruise.alpha * healingOpacity * 62 / j
        );

        ellipse(
          bruise.x, bruise.y,
          bruise.radius * (2 + j * 0.6),
          bruise.radius * (1.25 + j * 0.3)
        );
      }
    }

    ctx.restore();

    // Chocolate, cream, cherry and face.
    this.drawChocolateTop();
    this.drawChocolateDamage();
    this.drawCream();
    this.drawCherry();
    this.drawHighlights();

    // Easter egg glow.
    if (this.secret) {
      noStroke();
      fill(
        255, 239, 142,
        25 + 20 * Math.sin(this.time * 5)
      );
      ellipse(0, -14, 190, 190);
    }

    this.drawFace();
    pop();
  }
}

// =====================================================
// 27. MINI SQUISHY CLASS
// =====================================================
class MiniSquishy {
  constructor(x, y, radius, side) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.side = side;

    this.travelSpeed = random(55, 105);

    const angle = side === 1
      ? random(-PI / 2, PI / 2)
      : random(PI / 2, PI * 1.5);

    this.heading = angle;
    this.vx = Math.cos(angle) * this.travelSpeed;
    this.vy = Math.sin(angle) * this.travelSpeed;

    this.rotation = random(-0.4, 0.4);
    this.spin = random(-1.4, 1.4);
    this.phase = random(TWO_PI);
    this.wanderOffset = random(TWO_PI);
    this.time = 0;

    // Use a real timestamp for mini lifespan.
    this.bornAt = performance.now();
    this.age = 0;
    this.finished = false;

    this.meltStart = MINI_MELT_START;
    this.meltDuration = MINI_MELT_DURATION;
  }

  // 28. FLOATING MOVEMENT
  update(dt) {
    this.age = secondsSince(this.bornAt);
    this.time += dt;

    if (this.age >= this.meltStart + this.meltDuration) {
      this.finished = true;
      return;
    }

    // Two sine waves create organic wandering.
    const wander =
      Math.sin(this.time * 0.75 + this.wanderOffset) * 0.55 +
      Math.sin(this.time * 0.31 + this.phase) * 0.3;

    this.heading += wander * dt;

    const margin = this.radius + 8;
    const edgeZone = Math.min(
      90, width * 0.2, height * 0.2
    );

    // Gradually steer away from edges.
    if (this.x < margin + edgeZone) {
      this.heading += Math.sin(-this.heading) * 1.5 * dt;
    }
    if (this.x > width - margin - edgeZone) {
      this.heading += Math.sin(PI - this.heading) * 1.5 * dt;
    }
    if (this.y < margin + edgeZone) {
      this.heading += Math.sin(PI / 2 - this.heading) * 1.5 * dt;
    }
    if (this.y > height - margin - edgeZone) {
      this.heading += Math.sin(-PI / 2 - this.heading) * 1.5 * dt;
    }

    const desiredVX =
      Math.cos(this.heading) * this.travelSpeed;
    const desiredVY =
      Math.sin(this.heading) * this.travelSpeed;

    this.vx = easeTo(this.vx, desiredVX, 2.5, dt);
    this.vy = easeTo(this.vy, desiredVY, 2.5, dt);

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Extra gentle bobbing.
    this.x +=
      Math.cos(this.phase + this.time * 1.2) * 5 * dt;
    this.y +=
      Math.sin(this.phase + this.time * 1.6) * 8 * dt;

    this.rotation += this.spin * dt;
    this.spin *= Math.exp(-0.2 * dt);

    // Hard bounce keeps minis inside the screen.
    if (this.x < margin) {
      this.x = margin;
      this.vx = Math.abs(this.vx);
      this.heading = Math.atan2(this.vy, this.vx);
    }
    if (this.x > width - margin) {
      this.x = width - margin;
      this.vx = -Math.abs(this.vx);
      this.heading = Math.atan2(this.vy, this.vx);
    }
    if (this.y < margin) {
      this.y = margin;
      this.vy = Math.abs(this.vy);
      this.heading = Math.atan2(this.vy, this.vx);
    }
    if (this.y > height - margin) {
      this.y = height - margin;
      this.vy = -Math.abs(this.vy);
      this.heading = Math.atan2(this.vy, this.vx);
    }
  }

  // 29. MELTING ANIMATION
  display() {
    if (this.finished) return;

    const melting = this.age >= this.meltStart;
    const progress = melting
      ? constrain(
          (this.age - this.meltStart) / this.meltDuration,
          0, 1
        )
      : 0;

    // Smoothstep melting transition.
    const melt = progress * progress * (3 - 2 * progress);
    const opacity = 1 - melt;
    const vertical = 1 - 0.9 * melt;
    const horizontal = 1 + 0.65 * melt;
    const size = 1 - 0.35 * melt;

    push();
    drawingContext.globalAlpha *= opacity;

    translate(this.x, this.y + 24 * melt);
    rotate(this.rotation * (1 - melt));

    const wobble =
      1 + 0.06 * Math.sin(this.time * 4 + this.phase);

    scale(
      wobble * horizontal * size,
      (1 / wobble) * vertical * size
    );

    noStroke();

    // Yellow pudding body.
    fill('#eabf53');
    ellipse(
      0, 2,
      this.radius * 2.25,
      this.radius * 1.95
    );

    fill('#ffdf76');
    ellipse(
      -1, -1,
      this.radius * 2.15,
      this.radius * 1.85
    );

    fill('#fff0a8');
    ellipse(
      -this.radius * 0.35,
      -this.radius * 0.3,
      this.radius * 0.5,
      this.radius * 0.7
    );

    // Chocolate topping.
    fill('#8c4b35');
    ellipse(
      0,
      -this.radius * 0.64,
      this.radius * 1.9,
      this.radius * 0.5
    );

    fill('#aa674e');
    ellipse(
      0,
      -this.radius * 0.74,
      this.radius * 1.5,
      this.radius * 0.25
    );

    // Mini >o< eyes.
    stroke('#5c251d');
    strokeWeight(Math.max(1.3, this.radius * 0.12));
    strokeCap(ROUND);
    noFill();

    line(
      -this.radius * 0.45, 0,
      -this.radius * 0.24,
      this.radius * 0.13
    );
    line(
      -this.radius * 0.24,
      this.radius * 0.13,
      -this.radius * 0.45,
      this.radius * 0.25
    );
    line(
      this.radius * 0.45, 0,
      this.radius * 0.24,
      this.radius * 0.13
    );
    line(
      this.radius * 0.24,
      this.radius * 0.13,
      this.radius * 0.45,
      this.radius * 0.25
    );

    // Mouth.
    noStroke();
    fill('#5c251d');
    ellipse(
      0,
      this.radius * 0.25,
      this.radius * 0.3,
      this.radius * 0.35
    );

    fill('#f29fac');
    ellipse(
      0,
      this.radius * 0.27,
      this.radius * 0.2,
      this.radius * 0.24
    );

    pop();
  }
}

// =====================================================
// 30. TEMPORARY PARTICLES
// =====================================================
class Crumb {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;

    this.velocityX = random(-140, 140);
    this.velocityY = random(-210, -50);
    this.life = random(0.5, 1.25);
    this.maxLife = this.life;
    this.particleSize = random(3, 9);
  }

  update(dt) {
    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;

    // Simulated gravity.
    this.velocityY += 330 * dt;
    this.life -= dt;
  }

  display() {
    push();
    noStroke();

    const opacity =
      255 * Math.max(0, this.life / this.maxLife);

    if (this.type === 'chip') {
      fill(143, 79, 59, opacity);
    } else {
      fill(244, 193, 90, opacity);
    }

    translate(this.x, this.y);

    if (this.type === 'star') {
      textAlign(CENTER, CENTER);
      textSize(this.particleSize * 2);
      text('✦', 0, 0);
    } else {
      ellipse(0, 0, this.particleSize);
    }
    pop();
  }
}

// Create a temporary particle burst.
function emitCrumbs(x, y, amount, type) {
  for (let i = 0; i < amount; i++) {
    crumbs.push(new Crumb(x, y, type));
  }

  // Limit particle count for performance.
  if (crumbs.length > 260) {
    crumbs.splice(0, crumbs.length - 260);
  }
}

// =====================================================
// 31. EXPLOSION FRAGMENTS
// =====================================================
class ExplosionPiece {
  constructor(x, y, sizeMultiplier) {
    this.x = x;
    this.y = y;

    // Random direction and outward velocity.
    const angle = random(TWO_PI);
    const speed = random(180, 560);

    this.vx = Math.cos(angle) * speed;
    this.vy =
      Math.sin(angle) * speed - random(40, 150);

    this.pieceSize =
      random(4, 17) * sizeMultiplier;

    // 0 = pudding, 1 = chocolate,
    // 2 = cream, 3 = cherry.
    this.type = Math.floor(random(4));

    this.rotation = random(TWO_PI);
    this.spin = random(-8, 8);

    this.life = random(1.4, 3.3);
    this.maxLife = this.life;
    this.finished = false;
  }

  // 32. EXPLOSION PHYSICS
  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Gravity and air resistance.
    this.vy += 300 * dt;
    this.vx *= Math.exp(-0.45 * dt);

    this.rotation += this.spin * dt;
    this.life -= dt;

    if (this.life <= 0) this.finished = true;
  }

  // 33. DRAW EXPLOSION FRAGMENTS
  display() {
    if (this.finished) return;

    push();
    translate(this.x, this.y);
    rotate(this.rotation);

    // Fade as the fragment runs out of lifetime.
    drawingContext.globalAlpha *= constrain(
      this.life / Math.min(this.maxLife, 0.9),
      0, 1
    );

    noStroke();

    if (this.type === 0) {
      // Yellow pudding fragment.
      fill('#f8d65d');
      ellipse(
        0, 0,
        this.pieceSize * 1.4,
        this.pieceSize
      );

      fill('#ffe895');
      ellipse(
        -this.pieceSize * 0.18,
        -this.pieceSize * 0.15,
        this.pieceSize * 0.5
      );

    } else if (this.type === 1) {
      // Chocolate fragment.
      fill('#8c4b35');
      rect(
        -this.pieceSize / 2,
        -this.pieceSize / 2,
        this.pieceSize,
        this.pieceSize * 0.65,
        4
      );

    } else if (this.type === 2) {
      // Cream fragment.
      fill('#f8f5ef');
      ellipse(
        0, 0,
        this.pieceSize * 1.3,
        this.pieceSize * 0.85
      );

    } else {
      // Cherry fragment.
      fill('#e64550');
      ellipse(
        0, 0,
        this.pieceSize * 0.85,
        this.pieceSize * 0.85
      );
    }

    pop();
  }
}

// =====================================================
// 34. PERMANENT EXPLOSION ENDING SCREEN
// =====================================================
function drawExplosionScreen() {
  if (!pudding.exploded) return;

  const elapsed = secondsSince(
    pudding.explosionStartedAt
  );

  // Explosion flash during the first 0.45 seconds.
  if (pudding.finaleState === 'exploding') {
    if (elapsed < 0.45) {
      const progress = elapsed / 0.45;

      push();
      noStroke();
      fill(
        255, 218, 125,
        140 * (1 - progress)
      );
      ellipse(
        width / 2,
        height / 2 + 30,
        100 + progress * 550
      );
      pop();
    }
    return;
  }

  // NEW: Only draw the final screen in 'ended' state.
  // This state has no timeout or automatic reset.
  if (pudding.finaleState !== 'ended') return;

  // Cover all old fragments with a clean background.
  // draw() will redraw this every frame indefinitely.
  background(255);

  push();
  noStroke();
  textAlign(CENTER, CENTER);

  // Ending title.
  fill('#76513a');
  textSize(Math.min(38, width * 0.075));
  textStyle(BOLD);
  text(
    'POP! YOUR PUDDING EXPLODED!',
    width / 2,
    height / 2 - 45
  );

  // Subtitle.
  textStyle(NORMAL);
  fill('#967866');
  textSize(16);
  text(
    '100 squishes. One very dramatic ending.',
    width / 2,
    height / 2 + 3
  );

  // Restart button.
  const bx = width / 2 - 85;
  const by = height / 2 + 65;

  const hovering =
    mouseX >= bx && mouseX <= bx + 170 &&
    mouseY >= by && mouseY <= by + 48;

  fill(hovering ? '#a8654c' : '#bd8064');
  rect(bx, by, 170, 48, 15);

  fill(255);
  textSize(17);
  textStyle(BOLD);
  text('RESTART', width / 2, by + 24);

  pop();
}

// =====================================================
// 35. RECORDED MP3 SOUNDS
// =====================================================
function stopRecordedSound() {
  if (!activeSound) return;

  activeSound.pause();
  activeSound.currentTime = 0;
  activeSound = null;
}

function playRandomSquish() {
  if (!soundEnabled || soundPool.length === 0) return;

  let choice = Math.floor(
    Math.random() * soundPool.length
  );

  // Don't repeat the previous recording.
  if (soundPool.length > 1) {
    while (choice === previousSoundIndex) {
      choice = Math.floor(
        Math.random() * soundPool.length
      );
    }
  }

  previousSoundIndex = choice;
  stopRecordedSound();

  const audio = soundPool[choice];
  audio.currentTime = 0;
  audio.volume = 0.65;
  activeSound = audio;

  audio.play().catch(error => {
    console.warn('Unable to play squish audio:', error);
  });

  audio.onended = () => {
    if (activeSound === audio) activeSound = null;
  };
}

// =====================================================
// 36. WEB AUDIO INITIALISATION
// =====================================================
function startAudio() {
  const AudioClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioClass) return;

  if (!audioContext) {
    audioContext = new AudioClass();
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

// =====================================================
// 37. SYNTHESISED SPECIAL SOUNDS
// =====================================================
function playSpecialSound(type) {
  if (!soundEnabled) return;

  startAudio();
  if (!audioContext) return;

  const now = audioContext.currentTime;

  const notes = type === 'secret'
    ? [523, 659, 784]
    : [160, 102];

  for (let i = 0; i < notes.length; i++) {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const start = now + i * 0.08;

    oscillator.type =
      type === 'chip' ? 'triangle' : 'sine';

    oscillator.frequency.setValueAtTime(
      notes[i], start
    );

    // Short volume envelope.
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(
      0.025, start + 0.015
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001, start + 0.17
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start(start);
    oscillator.stop(start + 0.19);
  }
}

// =====================================================
// 38. CARTOON EXPLOSION SOUND
// =====================================================
function playExplosionSound() {
  if (!soundEnabled) return;

  startAudio();
  if (!audioContext) return;

  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  // Descending triangle wave creates a cartoon boom.
  oscillator.type = 'triangle';

  oscillator.frequency.setValueAtTime(230, now);
  oscillator.frequency.exponentialRampToValueAtTime(
    48, now + 0.45
  );

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(
    0.17, now + 0.025
  );
  gain.gain.exponentialRampToValueAtTime(
    0.0001, now + 0.65
  );

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.68);
}

// =====================================================
// END OF sketch.js
// =====================================================