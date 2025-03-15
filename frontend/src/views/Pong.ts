import { div, canvas, button, h1, h2, p } from "@framework/tags";
import TerminalBox from "@components/TerminalBox";
import UseState from "@framework/UseState";

export default function PongGame() {
  const canvasElement = canvas({className: "w-full h-full border border-green-500/30 rounded"});
  let playerScore = UseState(0);
  let computerScore = UseState(0);
  let gameStarted =  UseState(false);
  let gameOver = UseState(false);
  let winner =  UseState("");

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
    playerScore: 0,
    computerScore: 0,
    gameStarted: false,
    gameOver: false,
  };

  const initGame = () => {
    state.canvasWidth =  canvasElement.width;
    state.canvasHeight =  canvasElement.height;
    state.playerY =  state.canvasHeight / 2 - PADDLE_HEIGHT / 2;
    state.computerY =  state.canvasHeight / 2 - PADDLE_HEIGHT / 2;
    state.ballX =  state.canvasWidth / 2;
    state.ballY =  state.canvasHeight / 2;
    state.ballSpeedX =  5;
    state.ballSpeedY =  2;
    state.playerScore = 0;
    state.computerScore = 0;
    
    playerScore.set(0)
    computerScore.set(0)
    
    state.gameStarted = true;
    state.gameOver = false;

    gameStarted.set(true);
    gameOver.set(false);
    winner.set("")

    // drawGame();
    // requestAnimationFrame(gameLoop);
  }

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!state.gameStarted || state.gameOver) return
    const rect = canvasElement.getBoundingClientRect()
    let mouseY: number

    if ("touches" in e) {
      // Touch event
      mouseY = e.touches[0].clientY - rect.top
    } else {
      // Mouse event
      mouseY = e.clientY - rect.top
    }

    // Update player paddle position
    state.playerY = mouseY - PADDLE_HEIGHT / 2

    // Keep paddle within canvas bounds
    if (state.playerY < 0) {
      state.playerY = 0
    }
    if (state.playerY > state.canvasHeight - PADDLE_HEIGHT) {
      state.playerY = state.canvasHeight - PADDLE_HEIGHT
    }
  }

  const gameLoop = () => {
    if (!gameStarted.get() || gameOver.get()) return;
    updateBall();
    updateComputer();
    drawGame();
    requestAnimationFrame(gameLoop);
  }

  const updateBall = () => {
    state.ballX += state.ballSpeedX;
    state.ballY += state.ballSpeedY;

    if (state.ballY < BALL_RADIUS || state.ballY > state.canvasHeight - BALL_RADIUS) {
      state.ballSpeedY = -state.ballSpeedY;
    }

    const playerPaddle = () => {
      if (
        state.ballX < PADDLE_WIDTH + BALL_RADIUS &&
        state.ballY > state.playerY &&
        state.ballY < state.playerY + PADDLE_HEIGHT
      ) {
        state.ballSpeedX = -state.ballSpeedX
  
        // Add some variation to the ball angle based on where it hits the paddle
        const deltaY = state.ballY - (state.playerY + PADDLE_HEIGHT / 2)
        state.ballSpeedY = deltaY * 0.35
      }
    }

    const computerPaddle = () => {
      if (
        state.ballX > state.canvasWidth - PADDLE_WIDTH - BALL_RADIUS &&
        state.ballY > state.computerY &&
        state.ballY < state.computerY + PADDLE_HEIGHT
      ) {
        state.ballSpeedX = -state.ballSpeedX
  
        // Add some variation to the ball angle based on where it hits the paddle
        const deltaY = state.ballY - (state.computerY + PADDLE_HEIGHT / 2)
        state.ballSpeedY = deltaY * 0.35
      }
    }

    playerPaddle()
    computerPaddle()

    // Ball out of bounds - scoring
    if (state.ballX < 0) {
      // Computer scores
      state.computerScore++
      computerScore.set(state.computerScore)
      resetBall()
      checkWinner()
    } else if (state.ballX > state.canvasWidth) {
      // Player scores
      state.playerScore++
      playerScore.set(state.playerScore)
      resetBall()
      checkWinner()
    }
  }

  const resetBall = () => {
    state.ballX = state.canvasWidth / 2
    state.ballY = state.canvasHeight / 2
    state.ballSpeedX = -state.ballSpeedX
    state.ballSpeedY = Math.random() * 4 - 2
  }

  const checkWinner = () => {
    if (state.playerScore >= WINNING_SCORE) {
      state.gameOver = true
      gameOver.set(true)
      winner.set("PLAYER")
    } else if (state.computerScore >= WINNING_SCORE) {
      state.gameOver = true
      gameOver.set(true)
      winner.set("COMPUTER")
    }
  }

  const updateComputer = () => {
    // Simple AI: follow the ball with some delay
    const computerCenter = state.computerY + PADDLE_HEIGHT / 2

    // Only move if the ball is moving toward the computer
    if (state.ballSpeedX > 0) {
      if (computerCenter < state.ballY - 35) {
        state.computerY += 6
      } else if (computerCenter > state.ballY + 35) {
        state.computerY -= 6
      }
    } else {
      // When ball is moving away, move toward the center with less precision
      if (computerCenter < state.canvasHeight / 2 - 30) {
        state.computerY += 3
      } else if (computerCenter > state.canvasHeight / 2 + 30) {
        state.computerY -= 3
      }
    }

    // Keep paddle within canvas bounds
    if (state.computerY < 0) {
      state.computerY = 0
    }
    if (state.computerY > state.canvasHeight - PADDLE_HEIGHT) {
      state.computerY = state.canvasHeight - PADDLE_HEIGHT
    }
  }

  const drawGame = () => {
    const ctx = canvasElement.getContext("2d");
    if (!ctx) return;

    const clearCanvas = () => {
      ctx.fillStyle = "#055000";
      ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);
    }

    const centerLine = () => {
      ctx.strokeStyle = "#00ff00"
      ctx.setLineDash([10, 15])
      ctx.beginPath()
      ctx.moveTo(state.canvasWidth / 2, 0)
      ctx.lineTo(state.canvasWidth / 2, state.canvasHeight)
      ctx.stroke()
      ctx.setLineDash([])
    }

    const drawPaddles = () => {
      // Draw paddles
      ctx.fillStyle = "#00ff00"

      // Player paddle
      ctx.fillRect(0, state.playerY, PADDLE_WIDTH, PADDLE_HEIGHT)

      // Computer paddle
      ctx.fillRect(state.canvasWidth - PADDLE_WIDTH, state.computerY, PADDLE_WIDTH, PADDLE_HEIGHT)
    }

    const drawBall = () => {
      ctx.beginPath()
      ctx.arc(state.ballX, state.ballY, BALL_RADIUS, 0, Math.PI * 2)
      ctx.fill()
    }

    const drawScore = () => {
      ctx.font = "30px monospace"
      ctx.textAlign = "center"
  
      // Player score
      ctx.fillText(state.playerScore.toString(), state.canvasWidth / 4, 50)
  
      // Computer score
      ctx.fillText(state.computerScore.toString(), (state.canvasWidth * 3) / 4, 50)
    }

    clearCanvas()
    centerLine()
    drawPaddles()
    drawBall()
    drawScore()
  }

  const handleResize = () => {
    const container = canvasElement.parentElement
    if (!container) return

    // Set canvas dimensions to match container
    canvasElement.width = container.clientWidth
    canvasElement.height = container.clientHeight

    // Update game state with new dimensions
    state.canvasWidth = canvasElement.width
    state.canvasHeight = canvasElement.height

    // Reset paddle positions
    state.playerY = canvasElement.height / 2 - PADDLE_HEIGHT / 2
    state.computerY = canvasElement.height / 2 - PADDLE_HEIGHT / 2

    // Reset ball position
    if (!state.gameStarted) {
      state.ballX = canvasElement.width / 2
      state.ballY = canvasElement.height / 2
    }

    // Redraw game
    drawGame()
  }

  handleResize()

  // Add event listeners
  window.addEventListener("resize", handleResize)
  canvasElement.addEventListener("mousemove", handleMouseMove)
  canvasElement.addEventListener("touchmove", handleMouseMove)

  // Draw initial state
  drawGame()
  if (gameStarted && !gameOver) {
    requestAnimationFrame(gameLoop)
  }
  
  /* CLEAN UP */
  // return () => {
  //   // Clean up event listeners
  //   window.removeEventListener("resize", handleResize)
  //   canvas.removeEventListener("mousemove", handleMouseMove)
  //   canvas.removeEventListener("touchmove", handleMouseMove)
  // }


  const GameTitle = () => {
    return  div({ className: "text-center mb-4" }, 
      h1({ className: "text-2xl font-bold tracking-wider" }, "TERMINAL PONG"),
      p({ className: "text-green-400/70 text-sm" }, "Move your mouse or finger to control the left paddle")
    )
  }

  const GameCanvas = () => {
    const GameOverlay = (ok:boolean) => {
      if (ok == false) return null
      return div({ className: "absolute inset-0 flex flex-col items-center justify-center bg-black/80" }, 
        h2({ className: "text-2xl font-bold mb-4" }, "TERMINAL PONG"),
        p({ className: "mb-6" }, `First to ${WINNING_SCORE} wins`),
        button({ 
          click: initGame,
          className: "px-6 py-2 border border-green-500 rounded hover:bg-green-500/20 transition"
        }, "START GAME")
      )
    }
    const GameOverlayStop = (ok:boolean) => {
        if (ok == false) return null
        return div({ className: "absolute inset-0 flex flex-col items-center justify-center bg-black/80" }, 
          h2({ className: "text-2xl font-bold mb-2" }, `${winner} WINS!`),
          p({ className: "mb-2" }, `Final Score: ${playerScore} - ${computerScore}`),
          button({ 
            click: initGame,
            className: "px-6 py-2 border border-green-500 rounded hover:bg-green-500/20 transition mt-4"
          }, "PLAY AGAIN")
        )
    }

    return div({ className: "relative w-full", style: { height: "60vh" } },
      canvasElement,
      GameOverlay(!gameStarted.get() && !gameOver.get()),
      GameOverlayStop(gameOver.get()),
    )
  }

  const GameControls = () => {
    const Reset = (ok:boolean) => {
      if (ok == false) return null
      button({ 
        click: () => {
          state.gameStarted = false;
          gameStarted.set(false);
        },
        className: "px-4 py-1 border border-green-500/50 rounded text-sm hover:bg-green-500/20 transition"
      }, "RESET")
    }

    return div({ className: "flex justify-between items-center mt-4" }, 
      div({ className: "text-sm" }, `PLAYER: ${playerScore}`),
      Reset(gameStarted.get() && !gameOver.get()),
      div({ className: "text-sm" }, `COMPUTER: ${computerScore}`)
    )
  }

  const Instructions = (winningScore:number) => {
    return div({ className: "mt-6 text-green-400/70 text-sm" }, 
      p({ className: "mb-1" }, "$ cat instructions.txt"),
      div({ className: "border border-green-500/20 p-2 rounded bg-black/50" }, 
        p({}, "- Move your mouse or finger to control the left paddle"),
        p({}, `- First player to reach ${winningScore} points wins`),
        p({}, "- The ball speeds up as the game progresses")
      )
    )
  }

  const Footer = () => {
    return div({ className: "mt-8 text-green-400/70 text-sm text-center" }, 
      `© ${new Date().getFullYear()} TERM_OS • All systems nominal`
    )
  }

  return TerminalBox("terminal@user:~/games/pong",
    GameTitle(),
    GameCanvas(),
    GameControls(),
    Instructions(WINNING_SCORE),
    Footer(),
  );
}








      






















































/*






      // Game Container 
      <div className="container mx-auto">
        <div className="border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10">
          <div className="flex items-center gap-2 border-b border-green-500/30 pb-2 mb-4">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <p className="text-xs">terminal@user:~/games/pong</p>
          </div>

          // Game Title 
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold tracking-wider">TERMINAL PONG</h1>
            <p className="text-green-400/70 text-sm">Move your mouse or finger to control the left paddle</p>
          </div>

          //  Game Canvas 
          <div className="relative w-full" style={{ height: "60vh" }}>
            <canvas ref={canvasRef} className="w-full h-full border border-green-500/30 rounded" />

            // Game Overlay 
            {!gameStarted && !gameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                <h2 className="text-2xl font-bold mb-4">TERMINAL PONG</h2>
                <p className="mb-6">First to {WINNING_SCORE} wins</p>
                <button
                  onClick={initGame}
                  className="px-6 py-2 border border-green-500 rounded hover:bg-green-500/20 transition"
                >
                  START GAME
                </button>
              </div>
            )}

            {gameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                <h2 className="text-2xl font-bold mb-2">{winner} WINS!</h2>
                <p className="mb-2">
                  Final Score: {playerScore} - {computerScore}
                </p>
                <button
                  onClick={initGame}
                  className="px-6 py-2 border border-green-500 rounded hover:bg-green-500/20 transition mt-4"
                >
                  PLAY AGAIN
                </button>
              </div>
            )}
          </div>

          //  Game Controls 
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm">
              <p>PLAYER: {playerScore}</p>
            </div>

            {gameStarted && !gameOver && (
              <button
                onClick={() => {
                  gameStateRef.current.gameStarted = false
                  setGameStarted(false)
                }}
                className="px-4 py-1 border border-green-500/50 rounded text-sm hover:bg-green-500/20 transition"
              >
                RESET
              </button>
            )}

            <div className="text-sm">
              <p>COMPUTER: {computerScore}</p>
            </div>
          </div>

          // Instructions 
          <div className="mt-6 text-green-400/70 text-sm">
            <p className="mb-1">$ cat instructions.txt</p>
            <div className="border border-green-500/20 p-2 rounded bg-black/50">
              <p>- Move your mouse or finger to control the left paddle</p>
              <p>- First player to reach {WINNING_SCORE} points wins</p>
              <p>- The ball speeds up as the game progresses</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-green-400/70 text-sm text-center">
          <p>© {new Date().getFullYear()} TERM_OS • All systems nominal</p>
        </div>
      </div>

*/