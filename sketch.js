let mario, marioImage, marioJumpImage, marioWalkImage, backgroundImage, kotakImage, enemiesImage, cloudImage;
let platforms = [];
let enemies = [];
let clouds = [];
let gravity = 0.6;
let jumpForce = 15;
let score = 0;
let isGameOver = false;

function preload() {
  marioImage = loadImage('img/mario.png');
  backgroundImage = loadImage('img/backgroundjpg.jpg');
  kotakImage = loadImage('img/kotak.png');
  marioJumpImage = loadImage('img/mariolompat.png');
  marioWalkImage = loadImage('img/marioberjalan.png');
  enemiesImage = loadImage('img/enemies.png');
  cloudImage = loadImage('img/cloud.png'); // Load cloud image
}

function setup() {
  createCanvas(800, 400);
  mario = new Mario(200, height - 50);
  platforms.push(new Platform(200, 300, 100, 10));
  platforms.push(new Platform(600, 200, 100, 10));
  enemies.push(new Enemy(width, height - 50));
  clouds.push(new Cloud(100, 100));
  clouds.push(new Cloud(300, 50));
  clouds.push(new Cloud(600, 120));
}

function draw() {
  background(backgroundImage);

  // Display and update clouds
  for (let i = 0; i < clouds.length; i++) {
    clouds[i].update();
    clouds[i].display();
  }

  if (!isGameOver) {
    mario.applyGravity(gravity);
    mario.update();
    mario.updateFrame();
  }

  mario.display();

  for (let i = 0; i < platforms.length; i++) {
    mario.checkCollision(platforms[i]);
    platforms[i].display();
  }

  if (!isGameOver) {
    for (let i = 0; i < enemies.length; i++) {
      if (mario.checkCollisionWithEnemy(enemies[i])) {
        score += 100;
        enemies[i].reset();
      } else if (mario.checkPassedEnemy(enemies[i])) {
        score += 1;
      }
      enemies[i].update();
      enemies[i].display();
    }

    if (keyIsDown(LEFT_ARROW)) {
      mario.moveLeft();
    }

    if (keyIsDown(RIGHT_ARROW)) {
      mario.moveRight();
    }
  } else {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(40);
    text("Game Over", width / 2, height / 2);
    textSize(20);
    text("Press ENTER to restart", width / 2, height / 2 + 40);
  }

  fill(255);
  textSize(20);
  text(`Score: ${score}`, width - 100, 30);
}

function keyPressed() {
  if (isGameOver && keyCode === ENTER) {
    restartGame();
  } else if (!isGameOver && keyCode === UP_ARROW) {
    mario.jump();
  }
}

function restartGame() {
  score = 0;
  isGameOver = false;
  mario = new Mario(200, height - 50);
  platforms = [];
  platforms.push(new Platform(200, 300, 100, 10));
  platforms.push(new Platform(600, 200, 100, 10));
  enemies = [];
  enemies.push(new Enemy(width, height - 50));
  clouds = [];
  clouds.push(new Cloud(100, 100));
  clouds.push(new Cloud(300, 50));
  clouds.push(new Cloud(600, 120));
}

class Mario {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.isJumping = false;
    this.isMoving = false;
    this.walkFrames = [marioWalkImage];
    this.currentFrame = 0;
  }

  applyGravity(gravity) {
    this.ySpeed += gravity;
    this.y += this.ySpeed;

    if (this.y > height - this.height) {
      this.y = height - this.height;
      this.ySpeed = 0;
      this.isJumping = false;
    }
  }

  jump() {
    if (!this.isJumping) {
      this.ySpeed = -jumpForce;
      this.isJumping = true;
    }
  }

  moveLeft() {
    this.xSpeed = -5;
    this.isMoving = true;
  }

  moveRight() {
    this.xSpeed = 5;
    this.isMoving = true;
  }

  update() {
    this.x += this.xSpeed;

    if (this.x < 0) {
      this.x = 0;
    } else if (this.x > width - this.width) {
      this.x = width - this.width;
    }

    this.xSpeed *= 0.8;

    if (abs(this.xSpeed) < 0.1) {
      this.xSpeed = 0;
      this.isMoving = false;
    }
  }

  checkCollision(platform) {
    if (
      this.y + this.height >= platform.y &&
      this.y + this.height <= platform.y + 10 &&
      this.x + this.width >= platform.x &&
      this.x <= platform.x + platform.width
    ) {
      this.y = platform.y - this.height;
      this.ySpeed = 0;
      this.isJumping = false;
    }
  }

  checkCollisionWithEnemy(enemy) {
    if (
      this.x + this.width >= enemy.x &&
      this.x <= enemy.x + enemy.width &&
      this.y + this.height >= enemy.y &&
      this.y <= enemy.y + enemy.height
    ) {
      if (this.isJumping) {
        return true;
      } else {
        gameOver();
      }
    }
    return false;
  }

  checkPassedEnemy(enemy) {
    if (this.x > enemy.x + enemy.width && !enemy.passed) {
      enemy.passed = true;
      return true;
    }
    return false;
  }

  updateFrame() {
    if (this.isMoving && frameCount % 8 === 0) {
      this.currentFrame++;
      if (this.currentFrame >= this.walkFrames.length) {
        this.currentFrame = 0;
      }
    }
  }

  display() {
    fill(255, 0, 0);
    push();
    translate(this.x, this.y);
    if (this.xSpeed < 0) {
      scale(-1, 1);
    }

    if (this.isJumping) {
      if (this.xSpeed < 0) {
        image(marioJumpImage, 0, 0, this.width, this.height);
      } else {
        image(marioJumpImage, 0, 0, this.width, this.height);
      }
    } else if (this.isMoving) {
      if (this.xSpeed < 0) {
        image(this.walkFrames[this.currentFrame], 0, 0, this.width, this.height);
      } else {
        image(this.walkFrames[this.currentFrame], 0, 0, this.width, this.height);
      }
    } else {
      image(marioImage, 0, 0, this.width, this.height);
    }
    pop();
  }
}

class Platform {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = 30;
  }

  display() {
    fill(255);
    image(kotakImage, this.x, this.y, this.width, this.height);
  }
}

class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.xSpeed = -2;
    this.passed = false;
  }

  update() {
    this.x += this.xSpeed;

    if (this.x < -this.width) {
      this.reset();
    }
  }

  reset() {
    this.x = width;
    this.passed = false;
  }

  display() {
    fill(0, 255, 0);
    image(enemiesImage, this.x, this.y, this.width, this.height);
  }
}

class Cloud {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 60;
    this.height = 40;
    this.xSpeed = 0.5;
  }

  update() {
    this.x += this.xSpeed;

    if (this.x > width) {
      this.x = -this.width;
    }
  }

  display() {
    fill(255);
    image(cloudImage, this.x, this.y, this.width, this.height);
  }
}

function gameOver() {
  isGameOver = true;
}
