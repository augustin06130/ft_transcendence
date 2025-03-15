// import TerminalBox, { withTerminalHostname } from "@components/TerminalBox";

// export default function Pong() {
//   const cmdName = withTerminalHostname("./pong");
//   return TerminalBox(cmdName);
// }


import { div, canvas, button, h1, p, span } from "@framework/tags";
import TerminalBox from "@components/TerminalBox";
import CommandOutput from "@components/CommandOutput";

function PongGame() {
  let canvasElement;
  let playerScore = 0;
  let computerScore = 0;
  let gameStarted = false;
  let gameOver = false;
  let winner = "";

  const PADDLE_HEIGHT = 100;
  const PADDLE_WIDTH = 10;
  const BALL_RADIUS = 8;
  const WINNING_SCORE = 5;

  let state = {
    playerY: 0,
    computerY: 0,
    ballX: 0,
    ballY: 0,
    ballSpeedX: 0,
    ballSpeedY: 0,
    canvasWidth: 0,
    canvasHeight: 0,
  };

  function initGame() {
    if (!canvasElement) return;
    state.canvasWidth = canvasElement.width;
    state.canvasHeight = canvasElement.height;
    state.playerY = state.canvasHeight / 2 - PADDLE_HEIGHT / 2;
    state.computerY = state.canvasHeight / 2 - PADDLE_HEIGHT / 2;
    state.ballX = state.canvasWidth / 2;
    state.ballY = state.canvasHeight / 2;
    state.ballSpeedX = 5;
    state.ballSpeedY = 2;
    playerScore = 0;
    computerScore = 0;
    gameStarted = true;
    gameOver = false;
    winner = "";
    drawGame();
    requestAnimationFrame(gameLoop);
  }

  function gameLoop() {
    if (!gameStarted || gameOver) return;
    updateBall();
    updateComputer();
    drawGame();
    requestAnimationFrame(gameLoop);
  }

  function updateBall() {
    state.ballX += state.ballSpeedX;
    state.ballY += state.ballSpeedY;

    if (state.ballY < BALL_RADIUS || state.ballY > state.canvasHeight - BALL_RADIUS) {
      state.ballSpeedY = -state.ballSpeedY;
    }
  }

  function updateComputer() {
    const computerCenter = state.computerY + PADDLE_HEIGHT / 2;
    if (state.ballSpeedX > 0) {
      if (computerCenter < state.ballY - 35) state.computerY += 6;
      else if (computerCenter > state.ballY + 35) state.computerY -= 6;
    }
  }

  function drawGame() {
    if (!canvasElement) return;
    const ctx = canvasElement.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);
  }

  function startOverlay() {
    return div({ class: "absolute inset-0 flex flex-col items-center justify-center bg-black/80" },
      h1({ class: "text-2xl font-bold" }, "TERMINAL PONG"),
      p({}, `First to ${WINNING_SCORE} wins`),
      button({
        class: "px-6 py-2 border border-green-500 rounded hover:bg-green-500/20 transition",
        onclick: initGame
      }, "START GAME")
    );
  }

  return TerminalBox("terminal@user:~/games/pong",
    div({ class: "relative w-full", style: "height: 60vh;" },
      canvas({
        class: "w-full h-full border border-green-500/30 rounded",
        ref: (el) => canvasElement = el
      }),
      (!gameStarted && !gameOver) ? startOverlay() : null
    ),
    div({ class: "text-center mt-4" },
      span({}, `PLAYER: ${playerScore} - COMPUTER: ${computerScore}`)
    )
  );
}

export default PongGame;
