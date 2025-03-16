import { canvas } from "@framework/tags";

const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 10;
const BALL_RADIUS = 8;
export const WINNING_SCORE = 5;

type PongState = {
  playerY: number;
  computerY: number;
  ballX: number;
  ballY: number;
  ballSpeedX: number;
  ballSpeedY: number;
  canvasWidth: number;
  canvasHeight: number;
  playerScore: number;
  computerScore: number;
  gameStarted: boolean;
  gameOver: boolean;
  winner:string;
}

export default class PongGame {
  canvasElement: HTMLCanvasElement;
  state:PongState;

  constructor() {
    // Event listeners
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.gameLoop = this.gameLoop.bind(this);
    this.initGame = this.initGame.bind(this);

    this.canvasElement = canvas({
      className: "w-full h-full border border-green-500/30 rounded",
      onmousemove: this.handleMouseMove,
      ontouchmove: this.handleMouseMove,
      event: {
        onMounted: this.handleResize,
      }
    });
    this.state = {
      playerY: 0,
      computerY: 0,
      ballX: 0,
      ballY: 0,
      ballSpeedX: 0,
      ballSpeedY: 0,
      canvasWidth: 0,
      canvasHeight: 0,
      playerScore: 0,
      computerScore: 0,
      gameStarted: false,
      gameOver: false,
      winner:"",
    };
  }

  initGame() {
    this.state.canvasWidth = this.canvasElement.width;
    this.state.canvasHeight = this.canvasElement.height;

    this.state.playerY = this.state.canvasHeight / 2 - PADDLE_HEIGHT / 2;
    this.state.computerY = this.state.canvasHeight / 2 - PADDLE_HEIGHT / 2;

    this.state.ballX = this.state.canvasWidth / 2;
    this.state.ballY = this.state.canvasHeight / 2;

    this.state.ballSpeedX = 5;
    this.state.ballSpeedY = 2;

    this.state.playerScore = 0;
    this.state.computerScore = 0;

    this.state.gameStarted = true;
    this.state.gameOver = false;

    // Draw initial state
    // this.drawGame();
    // requestAnimationFrame(this.gameLoop);
  }

  handleMouseMove(e:MouseEvent | TouchEvent) {
    if (!this.state.gameStarted || this.state.gameOver) return;
    const rect = this.canvasElement.getBoundingClientRect();
    let mouseY:number;

    if ("touches" in e) {
      mouseY = e.touches[0].clientY - rect.top;
    } else {
      mouseY = e.clientY - rect.top;
    }

    this.state.playerY = mouseY - PADDLE_HEIGHT / 2;

    // Keep paddle within canvas bounds
    if (this.state.playerY < 0) {
      this.state.playerY = 0;
    }
    if (this.state.playerY > this.state.canvasHeight - PADDLE_HEIGHT) {
      this.state.playerY = this.state.canvasHeight - PADDLE_HEIGHT;
    }
  }

  gameLoop() {
    if (!this.state.gameStarted || this.state.gameOver) return;
    this.updateBall();
    this.updateComputer();
    this.drawGame();
    requestAnimationFrame(this.gameLoop);
  }

  updateBall() {
    this.state.ballX += this.state.ballSpeedX;
    this.state.ballY += this.state.ballSpeedY;

    if (this.state.ballY < BALL_RADIUS || this.state.ballY > this.state.canvasHeight - BALL_RADIUS) {
      this.state.ballSpeedY = -this.state.ballSpeedY;
    }

    this.playerPaddle();
    this.computerPaddle();

    // Ball out of bounds - scoring
    if (this.state.ballX < 0) {
      // Computer scores
      this.state.computerScore++;
      this.resetBall();
      this.checkWinner();
    } else if (this.state.ballX > this.state.canvasWidth) {
      // Player scores
      this.state.playerScore++;
      this.resetBall();
      this.checkWinner();
    }
  }

  playerPaddle() {
    if (
      this.state.ballX < PADDLE_WIDTH + BALL_RADIUS &&
      this.state.ballY > this.state.playerY &&
      this.state.ballY < this.state.playerY + PADDLE_HEIGHT
    ) {
      this.state.ballSpeedX = -this.state.ballSpeedX;

      const deltaY = this.state.ballY - (this.state.playerY + PADDLE_HEIGHT / 2);
      this.state.ballSpeedY = deltaY * 0.35;
    }
  }

  computerPaddle() {
    if (
      this.state.ballX > this.state.canvasWidth - PADDLE_WIDTH - BALL_RADIUS &&
      this.state.ballY > this.state.computerY &&
      this.state.ballY < this.state.computerY + PADDLE_HEIGHT
    ) {
      this.state.ballSpeedX = -this.state.ballSpeedX;

      const deltaY = this.state.ballY - (this.state.computerY + PADDLE_HEIGHT / 2);
      this.state.ballSpeedY = deltaY * 0.35;
    }
  }

  resetBall() {
    this.state.ballX = this.state.canvasWidth / 2;
    this.state.ballY = this.state.canvasHeight / 2;
    this.state.ballSpeedX = -this.state.ballSpeedX;
    this.state.ballSpeedY = Math.random() * 4 - 2;
  }

  checkWinner() {
    if (this.state.playerScore >= WINNING_SCORE) {
      this.state.gameOver = true;
      this.state.winner = "PLAYER";
    } else if (this.state.computerScore >= WINNING_SCORE) {
      this.state.gameOver = true;
      this.state.winner = "COMPUTER";
    }
  }

  updateComputer() {
    const computerCenter = this.state.computerY + PADDLE_HEIGHT / 2;

    if (this.state.ballSpeedX > 0) {
      if (computerCenter < this.state.ballY - 35) {
        this.state.computerY += 6;
      } else if (computerCenter > this.state.ballY + 35) {
        this.state.computerY -= 6;
      }
    } else {
      if (computerCenter < this.state.canvasHeight / 2 - 30) {
        this.state.computerY += 3;
      } else if (computerCenter > this.state.canvasHeight / 2 + 30) {
        this.state.computerY -= 3;
      }
    }

    if (this.state.computerY < 0) {
      this.state.computerY = 0;
    }
    if (this.state.computerY > this.state.canvasHeight - PADDLE_HEIGHT) {
      this.state.computerY = this.state.canvasHeight - PADDLE_HEIGHT;
    }
  }

  drawGame() {
    const ctx = this.canvasElement.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, this.state.canvasWidth, this.state.canvasHeight);

    ctx.strokeStyle = "#00ff00";
    ctx.setLineDash([10, 15]);
    ctx.beginPath();
    ctx.moveTo(this.state.canvasWidth / 2, 0);
    ctx.lineTo(this.state.canvasWidth / 2, this.state.canvasHeight);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#00ff00";
    ctx.fillRect(0, this.state.playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(this.state.canvasWidth - PADDLE_WIDTH, this.state.computerY, PADDLE_WIDTH, PADDLE_HEIGHT);

    ctx.beginPath();
    ctx.arc(this.state.ballX, this.state.ballY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "30px monospace";
    ctx.textAlign = "center";
    ctx.fillText(this.state.playerScore.toString(), this.state.canvasWidth / 4, 50);
    ctx.fillText(this.state.computerScore.toString(), (this.state.canvasWidth * 3) / 4, 50);
  }

  handleResize() {
    const container = this.canvasElement.parentElement;
    if (!container) return;

    this.canvasElement.width = container.clientWidth;
    this.canvasElement.height = container.clientHeight;

    this.state.canvasWidth = this.canvasElement.width;
    this.state.canvasHeight = this.canvasElement.height;

    this.state.playerY = this.canvasElement.height / 2 - PADDLE_HEIGHT / 2;
    this.state.computerY = this.canvasElement.height / 2 - PADDLE_HEIGHT / 2;

    this.drawGame();
  }

  render() {
    window.addEventListener("resize", this.handleResize);
    if (this.state.gameStarted && !this.state.gameOver) {
      requestAnimationFrame(this.gameLoop)
    }    
    return this.canvasElement
  }
}