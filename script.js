const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const scoreElement = document.getElementById('score-value');
const healthElement = document.getElementById('health-value');
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

// 玩家移动
function handlePlayerMove(e) {
    if (!gameIsRunning) return;
    const rect = gameContainer.getBoundingClientRect();
    const x = e.clientX - rect.left - player.offsetWidth / 2;
    const y = e.clientY - rect.top - player.offsetHeight / 2;
    
    player.style.left = `${Math.max(0, Math.min(x, gameContainer.offsetWidth - player.offsetWidth))}px`;
    player.style.top = `${Math.max(0, Math.min(y, gameContainer.offsetHeight - player.offsetHeight))}px`;
}

// 创建子弹
function createBullet() {
    if (!gameIsRunning) return;
    const bullet = document.createElement('div');
    bullet.className = 'bullet';
    bullet.style.left = `${player.offsetLeft + player.offsetWidth / 2 - 2.5}px`;
    bullet.style.top = `${player.offsetTop}px`;
    gameContainer.appendChild(bullet);
    bullets.push(bullet);
}

// 移动子弹
function moveBullets() {
    bullets.forEach((bullet, index) => {
        bullet.style.top = `${bullet.offsetTop - 5}px`;
        if (bullet.offsetTop < 0) {
            gameContainer.removeChild(bullet);
            bullets.splice(index, 1);
        }
    });
}

// 创建敌人
function createEnemy() {
    if (!gameIsRunning) return;
    const enemy = document.createElement('div');
    enemy.className = 'enemy';
    enemy.style.left = `${Math.random() * (gameContainer.offsetWidth - 30)}px`;
    enemy.style.top = '0px';
    enemy.health = 30;
    enemy.innerText = enemy.health;
    gameContainer.appendChild(enemy);
    enemies.push(enemy);
}

// 移动敌人
function moveEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.style.top = `${enemy.offsetTop + 2}px`;
        if (enemy.offsetTop > gameContainer.offsetHeight) {
            gameContainer.removeChild(enemy);
            enemies.splice(index, 1);
            decreasePlayerHealth(10);
        }
    });
}

// 碰撞检测
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
                    increaseScore(10);
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

// 碰撞检测辅助函数
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

// 增加分数
function increaseScore(amount) {
    score += amount;
    scoreElement.innerText = score;
}

// 减少玩家生命值
function decreasePlayerHealth(amount) {
    playerHealth -= amount;
    healthElement.innerText = playerHealth;
    if (playerHealth <= 0) {
        endGame();
    }
}

// 结束游戏
function endGame() {
    gameIsRunning = false;
    finalScoreElement.innerText = score;
    gameOverElement.classList.remove('hidden');
    gameContainer.classList.add('game-over');
    backgroundVideo.pause();
    backgroundMusic.volume = 0.5;  // 降低音量到50%
    player.style.display = 'none';
    document.getElementById('score').style.display = 'none';
    document.getElementById('health').style.display = 'none';
    clearInterval(bulletInterval);
    clearInterval(enemyInterval);
}

// 重新开始游戏
function restartGame() {
    score = 0;
    playerHealth = 100;
    scoreElement.innerText = score;
    healthElement.innerText = playerHealth;
    
    // 清除所有敌人和子弹
    enemies.forEach(enemy => gameContainer.removeChild(enemy));
    bullets.forEach(bullet => gameContainer.removeChild(bullet));
    enemies = [];
    bullets = [];
    
    gameOverElement.classList.add('hidden');
    gameContainer.classList.remove('game-over');
    startGame();
}

// 游戏循环
function gameLoop() {
    if (gameIsRunning) {
        moveBullets();
        moveEnemies();
        checkCollisions();
    }
    requestAnimationFrame(gameLoop);
}

// 开始游戏
function startGame() {
    startScreen.classList.add('hidden');
    player.style.display = 'block';
    document.getElementById('score').style.display = 'block';
    document.getElementById('health').style.display = 'block';
    
    // 设置玩家初始位置
    player.style.left = '50%';
    player.style.top = '80%';
    
    gameIsRunning = true;
    backgroundVideo.play();
    backgroundMusic.play().catch(e => console.log("Audio play failed:", e));
    backgroundMusic.volume = 1;  // 确保音量是100%
    
    // 开始创建子弹和敌人
    bulletInterval = setInterval(createBullet, 200);
    enemyInterval = setInterval(createEnemy, 1000);
    
    gameLoop();
}

// 事件监听器
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);
gameContainer.addEventListener('mousemove', handlePlayerMove);

// 初始设置
backgroundVideo.pause();  // 暂停视频，等待游戏开始