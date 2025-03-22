import { canvas, div, h2, p, button } from "@framework/tags";
import UseState from "@framework/UseState";

const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 10;
const BALL_RADIUS = 8;
export const WINNING_SCORE = 1;

export type gameModesType = 'ai'| 'pvp'| 'remote';
export const gameModes: gameModesType[] = ['ai', 'pvp', 'remote'];
enum gameMode {
  ai,
  pvp,
  remote,
}

type PongState = {
  role: "host" | "guest"
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
  winner: string;
  gameState: "pregame" | "dountdown" | "playing" | "score"
}

function overlay(option: {
  title: string,
  message: string,
  labelName: string,
  onclick: () => void
}): HTMLElement {
	let result:HTMLElement = div({ className: "absolute inset-0 flex flex-col items-center justify-center bg-black/80" },
      h2({ className: "text-2xl font-bold mb-4" }, option.title),
      p({ className: "mb-6" }, option.message),
      button({
        onclick: option.onclick,
        className: "px-6 py-2 border border-green-500 rounded hover:bg-green-500/20 transition"
      }, option.labelName)
    );

	result.update = function(html:string) {
      this.children[1].innerHTML = html;
	};

	return result;
}

export default class PongGame {
  canvasElement: HTMLCanvasElement;
  state: PongState;
  overlayStart: HTMLElement;
  overlayStop: HTMLElement;
  gameMode: gameModesType;

  constructor(gameMode: gameModesType) { // Ajout de gameMode comme paramètre
    this.gameMode = gameMode; // Initialisation de gameMode

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
    window.addEventListener("resize", this.handleResize);

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
      winner: "",
      gameState: "pregame"
    };

    this.overlayStart = overlay({
      title: "TERMINAL PONG",
      message: `First to ${WINNING_SCORE} wins`,
      labelName: "START GAME",
      onclick: this.initGame,
    });

    this.overlayStop = overlay({
      title: `${this.state.winner} WINS!`,
      message: `Final Score: ${this.state.playerScore} - ${this.state.computerScore}`,
      labelName: "PLAY AGAIN",
      onclick: this.initGame
    });
    this.overlayStop.style.visibility = "hidden";
  }

  setGameMode(gameMode: gameModesType) {
    this.gameMode = gameMode;
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

    this.overlayStart.style.visibility = "hidden"
    this.overlayStop.style.visibility = "hidden";

    // Draw initial state
    this.drawGame();
    requestAnimationFrame(this.gameLoop);
  }

  handleMouseMove(e: MouseEvent | TouchEvent) {
    if (!this.state.gameStarted || this.state.gameOver) return;
    const rect = this.canvasElement.getBoundingClientRect();
    let mouseY: number;

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
	if (this.state.playerScore < WINNING_SCORE && this.state.computerScore < WINNING_SCORE)
	  return

    this.state.winner = this.state.playerScore >= WINNING_SCORE ? "PLAYER" : "COMPUTER";
    this.state.gameOver = true;
	this.overlayStop.update(`Final Score: ${this.state.playerScore} - ${this.state.computerScore}`);
  	this.overlayStop.style.visibility = "visible";
  }

  updateComputer() {
    if (this.gameMode === 'ai') { // Utilisation de this.gameMode
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

  onOverlayStart(el: HTMLElement) {
    if (!this.state.gameStarted && !this.state.gameOver) {
      // el.style.display = 'block'
    }
    return el
  }


  render() {
    return div({ className: "relative w-full", style: { height: "60vh" } },
      this.canvasElement,
      this.overlayStart,
      this.overlayStop,
    );
  }
  // render() {
  //   // this.state.gameStarted = true;
  //   // this.state.gameOver = false;
  //   if (this.state.gameStarted && !this.state.gameOver) {
  //     requestAnimationFrame(this.gameLoop)
  //   }
  //   // this.initGame()
  //   return div({ className: "relative w-full", style: { height: "60vh" } },
  //     this.canvasElement,
  //     this.overlayStart,
  //     this.overlayStop,
  //   )
  // }

  reset() {
    this.state.playerScore = 0;
    this.state.computerScore = 0;
    this.state.gameStarted = false;
    this.state.gameOver = false;
    this.state.winner = "";
    this.resetBall();
    this.drawGame();
  }

  moveLeftPaddle(deltaY: number) {
    this.state.playerY += deltaY;

    // Garder le paddle dans les limites du canvas
    if (this.state.playerY < 0) {
      this.state.playerY = 0;
    }
    if (this.state.playerY > this.state.canvasHeight - PADDLE_HEIGHT) {
      this.state.playerY = this.state.canvasHeight - PADDLE_HEIGHT;
    }
  }

  moveRightPaddle(deltaY: number) {
    this.state.computerY += deltaY;

    // Garder le paddle dans les limites du canvas
    if (this.state.computerY < 0) {
      this.state.computerY = 0;
    }
    if (this.state.computerY > this.state.canvasHeight - PADDLE_HEIGHT) {
      this.state.computerY = this.state.canvasHeight - PADDLE_HEIGHT;
    }
  }
}
