class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();

        // 游戏参数
        this.paddleHeight = 10;
        this.paddleWidth = 75;
        this.ballRadius = 5;
        this.brickRowCount = 5;
        this.brickColumnCount = 12;

        // 游戏状态
        this.gameStarted = false;
        this.gameOver = false;

        // 设置砖块参数
        this.setupBrickParameters();

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

    gameLoop() {
        if (!this.gameOver) {
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        }
    }

    // 修改：使用已有的按钮而不是创建新按钮
    bindStartButton() {
        this.startButton.onclick = () => {
            this.gameStarted = true;
            this.startButton.style.display = 'none';
            this.initBallAndPaddle();
            // 重新开始游戏循环
            this.gameLoop();
        };
    }

    // 删除 createStartButton 方法，因为我们现在使用 HTML 中的按钮

    setupCanvas() {
        // 设置画布大小
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const size = Math.min(screenWidth * 0.9, screenHeight * 0.9, 800);

        this.canvas.width = size;
        this.canvas.height = size * 0.75;
    }

    initBricks() {
        const bricks = [];
        for (let c = 0; c < this.brickColumnCount; c++) {
            bricks[c] = [];
            for (let r = 0; r < this.brickRowCount; r++) {
                bricks[c][r] = { x: 0, y: 0, status: 1 };
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

        // 触摸移动
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const relativeX = e.touches[0].clientX - rect.left;
            const newPaddleX = Math.max(0, Math.min(this.canvas.width - this.paddleWidth, relativeX - this.paddleWidth / 2));
            this.paddle.x = newPaddleX;
        });

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
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 30,
            dx: 1.125,    // 从1.5改为1.125
            dy: -1.125    // 从1.5改为1.125
        };
    }

    // 新增：创建开始按钮
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

    // 修改碰撞检测逻辑
    collisionDetection() {
        for (let c = 0; c < this.brickColumnCount; c++) {
            for (let r = 0; r < this.brickRowCount; r++) {
                const b = this.bricks[c][r];
                if (b.status === 1) {
                    // 检测球的四个边界点与砖块的碰撞
                    const ballRight = this.ball.x + this.ballRadius;
                    const ballLeft = this.ball.x - this.ballRadius;
                    const ballTop = this.ball.y - this.ballRadius;
                    const ballBottom = this.ball.y + this.ballRadius;

                    if (ballRight > b.x &&
                        ballLeft < b.x + this.brickWidth &&
                        ballBottom > b.y &&
                        ballTop < b.y + this.brickHeight) {
                        // 确定碰撞方向
                        const fromBottom = Math.abs(ballTop - (b.y + this.brickHeight));
                        const fromTop = Math.abs(ballBottom - b.y);
                        const fromLeft = Math.abs(ballRight - b.x);
                        const fromRight = Math.abs(ballLeft - (b.x + this.brickWidth));
                        const min = Math.min(fromBottom, fromTop, fromLeft, fromRight);

                        if (min === fromBottom || min === fromTop) {
                            this.ball.dy = -this.ball.dy;
                        } else {
                            this.ball.dx = -this.ball.dx;
                        }

                        b.status = 0;
                        this.score++;

                        if (this.score === this.brickRowCount * this.brickColumnCount) {
                            this.gameOver = true;
                            alert('恭喜你赢了！');
                            document.location.reload();
                        }
                    }
                }
            }
        }
    }

    draw() {
        if (this.gameOver) {
            return;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBricks();
        this.drawBall();
        this.drawPaddle();
        this.drawScore();
        // 只在游戏开始后才进行碰撞检测和球的移动
        if (this.gameStarted) {
            this.collisionDetection();
            // 墙壁碰撞检测
            if(this.ball.x + this.ballRadius > this.canvas.width || 
               this.ball.x - this.ballRadius < 0) {
                this.ball.dx = -this.ball.dx;
            }
            if(this.ball.y - this.ballRadius < 0) {
                this.ball.dy = -this.ball.dy;
            } else if(this.ball.y + this.ballRadius > this.paddle.y && 
                     this.ball.y + this.ballRadius < this.paddle.y + this.paddleHeight) {
                if(this.ball.x > this.paddle.x && 
                   this.ball.x < this.paddle.x + this.paddleWidth) {
                    // 修改反弹角度计算逻辑
                    const hitPoint = (this.ball.x - this.paddle.x) / this.paddleWidth;
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
                    
                    const speed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
                    this.ball.dx = speed * Math.cos(angle);
                    this.ball.dy = -Math.abs(speed * Math.sin(angle));
                }
            }
            // 检查是否游戏结束
            if(this.ball.y + this.ballRadius > this.canvas.height) {
                this.gameOver = true;
                alert('游戏结束！');
                document.location.reload();
                return;
            }
            this.ball.x += this.ball.dx;
            this.ball.y += this.ball.dy;
        }
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
                    this.ctx.fillStyle = '#0095DD';
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
}

// 修改游戏启动代码
window.onload = () => {
    new Game();
};