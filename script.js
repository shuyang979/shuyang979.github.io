const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const scoreElement = document.getElementById('score-value');
const healthElement = document.getElementById('health-value');
const levelElement = document.getElementById('level-value');
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const gameOverElement = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');
const backgroundVideo = document.getElementById('background-video');
const backgroundMusic = document.getElementById('background-music');

let bullets = [];
let enemies = [];
let score = 0;
let playerHealth = 100;
let gameIsRunning = false;
let bulletInterval;
let enemyInterval;
let powerUpInterval;
let isTouching = false;
let scoreMultiplier = 1;
let multiplierTimer = null;
let currentLevel = 1;

function handlePlayerMove(e) {
    if (!gameIsRunning) return;
    let x, y;
    if (e.type.startsWith('mouse')) {
        x = e.clientX;
        y = e.clientY;
    } else if (e.type.startsWith('touch')) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
    }
    const rect = gameContainer.getBoundingClientRect();
    x -= rect.left;
    y -= rect.top;
    player.style.left = `${Math.max(0, Math.min(x - player.offsetWidth / 2, gameContainer.offsetWidth - player.offsetWidth))}px`;
    player.style.top = `${Math.max(0, Math.min(y - player.offsetHeight / 2, gameContainer.offsetHeight - player.offsetHeight))}px`;
}

function handleTouchStart(e) {
    isTouching = true;
    handlePlayerMove(e);
}

function handleTouchMove(e) {
    if (isTouching) {
        handlePlayerMove(e);
    }
}

function handleTouchEnd() {
    isTouching = false;
}

function createBullet() {
    if (!gameIsRunning) return;
    const bullet = document.createElement('div');
    bullet.className = 'bullet';
    const playerRect = player.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();
    bullet.style.left = `${playerRect.left + playerRect.width / 2 - containerRect.left - bullet.offsetWidth / 2}px`;
    bullet.style.top = `${playerRect.top - containerRect.top}px`;
    gameContainer.appendChild(bullet);
    bullets.push(bullet);
}

function moveBullets() {
    bullets.forEach((bullet, index) => {
        bullet.style.top = `${bullet.offsetTop - gameContainer.offsetHeight * 0.01}px`;
        if (bullet.offsetTop < 0) {
            gameContainer.removeChild(bullet);
            bullets.splice(index, 1);
        }
    });
}

function createEnemy() {
    if (!gameIsRunning) return;
    const enemy = document.createElement('div');
    enemy.className = 'enemy';
    
    const enemyType = Math.random();
    if (enemyType < 0.6) {
        enemy.classList.add('enemy-normal');
        enemy.health = 30;
    } else if (enemyType < 0.9) {
        enemy.classList.add('enemy-fast');
        enemy.health = 20;
    } else {
        enemy.classList.add('enemy-boss');
        enemy.health = 100;
    }
    
    enemy.style.left = `${Math.random() * (gameContainer.offsetWidth - enemy.offsetWidth)}px`;
    enemy.style.top = '0px';
    enemy.innerText = enemy.health;
    gameContainer.appendChild(enemy);
    enemies.push(enemy);
}

function moveEnemies() {
    enemies.forEach((enemy, index) => {
        let speed = gameContainer.offsetHeight * 0.005;
        if (enemy.classList.contains('enemy-fast')) {
            speed *= 1.5;
        } else if (enemy.classList.contains('enemy-boss')) {
            speed *= 0.7;
        }
        enemy.style.top = `${enemy.offsetTop + speed}px`;
        if (enemy.offsetTop > gameContainer.offsetHeight) {
            gameContainer.removeChild(enemy);
            enemies.splice(index, 1);
            decreasePlayerHealth(10);
        }
    });
}

function checkCollisions() {
    if (!gameIsRunning) return;
    
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (isColliding(bullet, enemy)) {
                gameContainer.removeChild(bullet);
                bullets.splice(bulletIndex, 1);
                enemy.health -= 10;
                enemy.innerText = enemy.health;
                if (enemy.health <= 0) {
                    gameContainer.removeChild(enemy);
                    enemies.splice(enemyIndex, 1);
                    increaseScore(enemy.classList.contains('enemy-boss') ? 30 : 10);
                }
            }
        });
    });

    enemies.forEach((enemy, index) => {
        if (isColliding(player, enemy)) {
            gameContainer.removeChild(enemy);
            enemies.splice(index, 1);
            decreasePlayerHealth(20);
        }
    });
}

function isColliding(a, b) {
    const aRect = a.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();
    return !(
        aRect.top > bRect.bottom ||
        aRect.bottom < bRect.top ||
        aRect.right < bRect.left ||
        aRect.left > bRect.right
    );
}

function increaseScore(amount) {
    score += amount * scoreMultiplier;
    scoreElement.innerText = score;
}

function decreasePlayerHealth(amount) {
    playerHealth -= amount;
    healthElement.innerText = playerHealth;
    if (playerHealth <= 0) {
        endGame();
    }
}

function activateMultiplier() {
    scoreMultiplier = 2;
    clearTimeout(multiplierTimer);
    multiplierTimer = setTimeout(() => {
        scoreMultiplier = 1;
    }, 10000); // 10秒后恢复正常
}

function createPowerUp() {
    if (!gameIsRunning) return;
    const powerUp = document.createElement('div');
    powerUp.className = 'power-up';
    powerUp.style.left = `${Math.random() * (gameContainer.offsetWidth - 30)}px`;
    powerUp.style.top = '0px';
    gameContainer.appendChild(powerUp);
    
    const powerUpInterval = setInterval(() => {
        powerUp.style.top = `${powerUp.offsetTop + 2}px`;
        if (powerUp.offsetTop > gameContainer.offsetHeight) {
            clearInterval(powerUpInterval);
            gameContainer.removeChild(powerUp);
        }
        if (isColliding(player, powerUp)) {
            clearInterval(powerUpInterval);
            gameContainer.removeChild(powerUp);
            activateMultiplier();
        }
    }, 50);
}

function updateLevel() {
    currentLevel = Math.floor(score / 100) + 1;
    levelElement.innerText = currentLevel;
    // 根据关卡调整游戏难度
    clearInterval(enemyInterval);
    enemyInterval = setInterval(createEnemy, 1000 / Math.sqrt(currentLevel));
}

function endGame() {
    gameIsRunning = false;
    finalScoreElement.innerText = score;
    gameOverElement.classList.remove('hidden');
    gameContainer.classList.add('game-over');
    backgroundVideo.pause();
    backgroundMusic.volume = 0.5;
    player.style.display = 'none';
    document.getElementById('score').style.display = 'none';
    document.getElementById('health').style.display = 'none';
    document.getElementById('level').style.display = 'none';
    clearInterval(bulletInterval);
    clearInterval(enemyInterval);
    clearInterval(powerUpInterval);
    gameContainer.removeEventListener('touchstart', handleTouchStart);
    gameContainer.removeEventListener('touchmove', handleTouchMove);
    gameContainer.removeEventListener('touchend', handleTouchEnd);
}

function restartGame() {
    score = 0;
    playerHealth = 100;
    scoreElement.innerText = score;
    healthElement.innerText = playerHealth;
    
    enemies.forEach(enemy => gameContainer.removeChild(enemy));
    bullets.forEach(bullet => gameContainer.removeChild(bullet));
    enemies = [];
    bullets = [];
    
    gameOverElement.classList.add('hidden');
    gameContainer.classList.remove('game-over');
    startGame();
}

let lastTime = 0;
function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = timestamp - lastTime;
    
    if (deltaTime > 16) { // 约60fps
        if (gameIsRunning) {
            moveBullets();
            moveEnemies();
            checkCollisions();
            updateLevel();
        }
        lastTime = timestamp;
    }
    requestAnimationFrame(gameLoop);
}

function startGame() {
    startScreen.classList.add('hidden');
    player.style.display = 'block';
    document.getElementById('score').style.display = 'block';
    document.getElementById('health').style.display = 'block';
    document.getElementById('level').style.display = 'block';
    
    player.style.left = '50%';
    player.style.top = '80%';
    
    gameIsRunning = true;
    backgroundVideo.play();
    backgroundMusic.play().catch(e => console.log("Audio play failed:", e));
    backgroundMusic.volume = 1;
    
    bulletInterval = setInterval(createBullet, 200);
    enemyInterval = setInterval(createEnemy, 1000);
    powerUpInterval = setInterval(createPower
