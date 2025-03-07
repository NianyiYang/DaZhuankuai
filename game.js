class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 初始化速度选择器
        this.speedSelector = document.getElementById('gameSpeed');
        this.selectedSpeed = parseFloat(this.speedSelector.value);
        
        // 添加黄色砖块和掉落物相关属性
        this.powerups = [];
        this.balls = [];
        
        this.setupCanvas();
    
        // 游戏参数初始化
        this.initializeGameParameters();
    
        // 初始化游戏对象
        this.initBallAndPaddle();
        this.bricks = this.initBricks();
        this.score = 0;
    
        // 事件监听
        this.bindEvents();
    
        // 获取开始按钮并绑定事件
        this.startButton = document.getElementById('startButton');
        this.bindStartButton();
    
        // 开始游戏循环
        this.gameLoop();
    }

    // 新增：将游戏参数初始化抽取为单独方法
    initializeGameParameters() {
        this.paddleHeight = 10;
        this.paddleWidth = 75;
        this.ballRadius = 5;
        this.brickRowCount = 5;
        this.brickColumnCount = 12;
        this.gameStarted = false;
        this.gameOver = false;
        this.setupBrickParameters();
    }

    // 优化1: 移除重复的 updateBallSpeed 方法，保留一个统一实现
    updateBallSpeed() {
        const currentSpeed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
        const newSpeed = this.baseSpeed * this.selectedSpeed;
        const ratio = newSpeed / currentSpeed;
        this.ball.dx *= ratio;
        this.ball.dy *= ratio;
    }

    gameLoop() {
        if (!this.gameOver) {
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        }
    }

    // 修改：使用已有的按钮而不是创建新按钮
    bindStartButton() {
        // 设置按钮样式
        this.startButton.style.padding = '12px 30px';
        this.startButton.style.fontSize = '18px';
        this.startButton.style.backgroundColor = '#4CAF50';
        this.startButton.style.color = 'white';
        this.startButton.style.border = 'none';
        this.startButton.style.borderRadius = '25px';
        this.startButton.style.cursor = 'pointer';
        this.startButton.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        this.startButton.style.transition = 'all 0.3s ease';

        // 添加悬停效果
        this.startButton.onmouseover = () => {
            this.startButton.style.backgroundColor = '#45a049';
            this.startButton.style.transform = 'translateY(-2px)';
            this.startButton.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.2)';
        };

        this.startButton.onmouseout = () => {
            this.startButton.style.backgroundColor = '#4CAF50';
            this.startButton.style.transform = 'translateY(0)';
            this.startButton.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        };

        this.startButton.onclick = () => {
            this.gameStarted = true;
            const controlsContainer = document.querySelector('.controls-container');
            controlsContainer.classList.add('hidden'); // 使用 CSS 类隐藏
            this.initBallAndPaddle();
            this.gameLoop();
        };
    }

    setupCanvas() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // 根据屏幕方向调整画布尺寸
        if (screenWidth < screenHeight) {
            // 竖屏模式
            this.canvas.width = screenWidth * 0.95;
            this.canvas.height = screenWidth * 1.2; // 增加高度比例
        } else {
            // 横屏模式
            const size = Math.min(screenWidth * 0.9, screenHeight * 0.9, 800);
            this.canvas.width = size;
            this.canvas.height = size * 0.75;
        }

        // 根据画布大小调整球的基础速度
        this.baseSpeed = Math.sqrt(this.canvas.width * this.canvas.height) / 300;
    }

    // 修改initBricks方法，随机添加黄色砖块
    initBricks() {
        const bricks = [];
        for (let c = 0; c < this.brickColumnCount; c++) {
            bricks[c] = [];
            for (let r = 0; r < this.brickRowCount; r++) {
                // 随机决定是否为黄色砖块，约20%的概率
                const isYellow = Math.random() < 0.2;
                bricks[c][r] = { 
                    x: 0, 
                    y: 0, 
                    status: 1, 
                    isYellow: isYellow 
                };
            }
        }
        return bricks;
    }

    bindEvents() {
        // 鼠标移动
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const relativeX = e.clientX - rect.left;
            const newPaddleX = Math.max(0, Math.min(this.canvas.width - this.paddleWidth, relativeX - this.paddleWidth / 2));
            this.paddle.x = newPaddleX;
        });

        // 修改触摸事件，使用整个文档作为触摸区域
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const relativeX = touch.clientX - rect.left;
            const newPaddleX = Math.max(0, Math.min(this.canvas.width - this.paddleWidth, relativeX - this.paddleWidth / 2));
            this.paddle.x = newPaddleX;
        }, { passive: false });

        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.paddle.x -= 20;
            }
            else if (e.key === 'ArrowRight') {
                this.paddle.x += 20;
            }

            // 确保挡板不会移出画布
            if (this.paddle.x < 0) {
                this.paddle.x = 0;
            }
            if (this.paddle.x + this.paddleWidth > this.canvas.width) {
                this.paddle.x = this.canvas.width - this.paddleWidth;
            }
        });
    }

    // 新增：初始化球和挡板位置的方法
    initBallAndPaddle() {
        this.paddle = {
            x: this.canvas.width / 2 - this.paddleWidth / 2,
            y: this.canvas.height - this.paddleHeight - 10
        };
        
        // 使用选定的速度
        const speed = this.baseSpeed * this.selectedSpeed;
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 30,
            dx: speed,
            dy: -speed
        };
    }

    // 优化2: 移除未使用的 createStartButton 方法，因为我们使用HTML中的按钮
    // 删除 createStartButton() 方法
    createStartButton() {
        const button = document.createElement('button');
        button.textContent = '开始游戏';
        button.style.position = 'absolute';
        button.style.left = '50%';
        button.style.top = '50%';
        button.style.transform = 'translate(-50%, -50%)';
        button.style.padding = '10px 20px';
        button.style.fontSize = '18px';
        button.style.cursor = 'pointer';

        button.onclick = () => {
            this.gameStarted = true;
            button.remove();
            this.initBallAndPaddle();  // 重置球和挡板位置
        };

        document.body.appendChild(button);
    }

    setupBrickParameters() {
        this.brickPadding = 4;
        this.brickOffsetTop = 30;
        this.brickOffsetLeft = 20;

        // 计算合适的砖块大小
        this.brickWidth = (this.canvas.width - 2 * this.brickOffsetLeft - (this.brickColumnCount - 1) * this.brickPadding) / this.brickColumnCount;
        this.brickHeight = 20;
    }

    drawBricks() {
        for (let c = 0; c < this.brickColumnCount; c++) {
            for (let r = 0; r < this.brickRowCount; r++) {
                if (this.bricks[c][r].status === 1) {
                    const brickX = (c * (this.brickWidth + this.brickPadding)) + this.brickOffsetLeft;
                    const brickY = (r * (this.brickHeight + this.brickPadding)) + this.brickOffsetTop;
                    this.bricks[c][r].x = brickX;
                    this.bricks[c][r].y = brickY;
                    this.ctx.beginPath();
                    this.ctx.rect(brickX, brickY, this.brickWidth, this.brickHeight);
                    // 根据砖块类型设置不同颜色
                    this.ctx.fillStyle = this.bricks[c][r].isYellow ? '#FFD700' : '#0095DD';
                    this.ctx.fill();
                    this.ctx.closePath();
                }
            }
        }
    }

    drawScore() {
        this.ctx.font = '16px Arial';
        this.ctx.fillStyle = '#0095DD';
        this.ctx.fillText('得分: ' + this.score, 8, 20);
    }

    drawBall() {
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ballRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#0095DD';
        this.ctx.fill();
        this.ctx.closePath();
    }

    drawPaddle() {
        this.ctx.beginPath();
        this.ctx.rect(this.paddle.x, this.paddle.y, this.paddleWidth, this.paddleHeight);
        this.ctx.fillStyle = '#0095DD';
        this.ctx.fill();
        this.ctx.closePath();
    }

    // 添加创建掉落物的方法
    createPowerup(x, y) {
        const size = 15;
        this.powerups.push({
            x: x + this.brickWidth / 2 - size / 2,
            y: y,
            width: size,
            height: size,
            speed: 2
        });
    }

    // 添加绘制掉落物的方法
    drawPowerups() {
        for (let i = 0; i < this.powerups.length; i++) {
            const powerup = this.powerups[i];
            this.ctx.beginPath();
            this.ctx.rect(powerup.x, powerup.y, powerup.width, powerup.height);
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fill();
            this.ctx.closePath();
        }
    }

    // 添加更新掉落物的方法
    updatePowerups() {
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            powerup.y += powerup.speed;
            
            // 检查是否与挡板碰撞
            if (powerup.y + powerup.height > this.paddle.y && 
                powerup.y < this.paddle.y + this.paddleHeight &&
                powerup.x + powerup.width > this.paddle.x && 
                powerup.x < this.paddle.x + this.paddleWidth) {
                
                // 移除掉落物
                this.powerups.splice(i, 1);
                
                // 球裂变成三个
                this.splitBall();
            }
            
            // 如果掉落物超出屏幕底部，移除它
            else if (powerup.y > this.canvas.height) {
                this.powerups.splice(i, 1);
            }
        }
    }

    // 添加球裂变的方法
    splitBall() {
        // 创建两个新球
        const speed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
        
        // 第一个新球，向左上方
        const ball1 = {
            x: this.ball.x,
            y: this.ball.y,
            dx: -speed * 0.7,
            dy: -speed * 0.7
        };
        
        // 第二个新球，向右上方
        const ball2 = {
            x: this.ball.x,
            y: this.ball.y,
            dx: speed * 0.7,
            dy: -speed * 0.7
        };
        
        // 将新球添加到球数组
        this.balls.push(ball1, ball2);
    }

    // 修改initBallAndPaddle方法，初始化球数组
    initBallAndPaddle() {
        this.paddle = {
            x: this.canvas.width / 2 - this.paddleWidth / 2,
            y: this.canvas.height - this.paddleHeight - 10
        };
        
        // 使用选定的速度
        const speed = this.baseSpeed * this.selectedSpeed;
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 30,
            dx: speed,
            dy: -speed
        };
        
        // 初始化球数组，只包含主球
        this.balls = [];
    }

    // 修改collisionDetection方法，处理黄色砖块
    collisionDetection() {
        // 检查主球的碰撞
        this.checkBallCollision(this.ball);
        
        // 检查额外球的碰撞
        for (let i = 0; i < this.balls.length; i++) {
            this.checkBallCollision(this.balls[i]);
        }
    }

    // 添加检查单个球碰撞的方法
    checkBallCollision(ball) {
        for (let c = 0; c < this.brickColumnCount; c++) {
            for (let r = 0; r < this.brickRowCount; r++) {
                const b = this.bricks[c][r];
                if (b.status === 1) {
                    if (ball.x + this.ballRadius > b.x && 
                        ball.x - this.ballRadius < b.x + this.brickWidth &&
                        ball.y + this.ballRadius > b.y && 
                        ball.y - this.ballRadius < b.y + this.brickHeight) {
                        
                        // 确定碰撞方向
                        const overlapX = Math.min(ball.x + this.ballRadius - b.x, b.x + this.brickWidth - (ball.x - this.ballRadius));
                        const overlapY = Math.min(ball.y + this.ballRadius - b.y, b.y + this.brickHeight - (ball.y - this.ballRadius));
                        
                        if (overlapX < overlapY) {
                            ball.dx = -ball.dx;
                        } else {
                            ball.dy = -ball.dy;
                        }
                        
                        // 如果是黄色砖块，创建掉落物
                        if (b.isYellow) {
                            this.createPowerup(b.x, b.y);
                        }
                        
                        b.status = 0;
                        this.score++;
                        
                        if (this.score === this.brickRowCount * this.brickColumnCount) {
                            this.gameOver = true;
                            alert('恭喜你赢了！');
                            document.location.reload();
                        }
                        
                        // 一旦检测到碰撞并处理，就可以跳出内层循环提高性能
                        break;
                    }
                }
            }
        }
    }

    // 添加绘制所有球的方法
    drawBalls() {
        // 绘制主球
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ballRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#0095DD';
        this.ctx.fill();
        this.ctx.closePath();
        
        // 绘制额外球
        for (let i = 0; i < this.balls.length; i++) {
            const ball = this.balls[i];
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, this.ballRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = '#0095DD';
            this.ctx.fill();
            this.ctx.closePath();
        }
    }

    // 修改draw方法，处理多个球和掉落物
    draw() {
        if (this.gameOver) {
            return;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBricks();
        this.drawBalls(); // 使用新方法绘制所有球
        this.drawPowerups(); // 绘制掉落物
        this.drawPaddle();
        this.drawScore();
        
        // 只在游戏开始后才进行碰撞检测和球的移动
        if (this.gameStarted) {
            this.collisionDetection();
            this.updatePowerups(); // 更新掉落物
            
            // 更新主球位置
            this.updateBallPosition(this.ball);
            
            // 更新额外球位置
            for (let i = this.balls.length - 1; i >= 0; i--) {
                const ball = this.balls[i];
                // 如果球出界，移除它
                if (ball.y + this.ballRadius > this.canvas.height) {
                    this.balls.splice(i, 1);
                    continue;
                }
                this.updateBallPosition(ball);
            }
            
            // 检查是否所有球都出界
            if (this.ball.y + this.ballRadius > this.canvas.height && this.balls.length === 0) {
                this.gameOver = true;
                alert('游戏结束！');
                document.location.reload();
                return;
            }
        }
    }

    // 添加更新球位置的方法
    updateBallPosition(ball) {
        // 墙壁碰撞检测
        if(ball.x + this.ballRadius > this.canvas.width || 
           ball.x - this.ballRadius < 0) {
            ball.dx = -ball.dx;
        }
        if(ball.y - this.ballRadius < 0) {
            ball.dy = -ball.dy;
        } else if(ball.y + this.ballRadius > this.paddle.y && 
                 ball.y + this.ballRadius < this.paddle.y + this.paddleHeight) {
            if(ball.x > this.paddle.x && 
               ball.x < this.paddle.x + this.paddleWidth) {
                // 修改反弹角度计算逻辑
                const hitPoint = (ball.x - this.paddle.x) / this.paddleWidth;
                const minAngle = Math.PI / 6; // 30度
                const maxAngle = Math.PI * 5 / 6; // 150度
                
                // 根据击中位置计算角度
                let angle;
                if (hitPoint <= 0.5) {
                    // 左半边：从150度到90度
                    angle = maxAngle - (hitPoint * 2) * (maxAngle - Math.PI/2);
                } else {
                    // 右半边：从90度到30度
                    angle = Math.PI/2 - ((hitPoint - 0.5) * 2) * (Math.PI/2 - minAngle);
                }
                
                const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
                ball.dx = speed * Math.cos(angle);
                ball.dy = -Math.abs(speed * Math.sin(angle));
            }
        }
        
        // 更新球的位置
        ball.x += ball.dx;
        ball.y += ball.dy;
    }
}

// 修改游戏启动代码
window.onload = () => {
    new Game();
};