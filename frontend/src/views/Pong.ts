import { div, canvas, button, h1, h2, p } from "@framework/tags";
import TerminalBox from "@components/TerminalBox";

import PongGame,{WINNING_SCORE} from "@components/Pong";

export default function PongGameView () {
  const game = new PongGame()

  const pongGameTitle = () => {
    return div({ className: "text-center mb-4" }, 
      h1({ className: "text-2xl font-bold tracking-wider" }, "TERMINAL PONG"),
      p({ className: "text-green-400/70 text-sm" }, "Move your mouse or finger to control the left paddle")
    );
  }

  const gameOverlayStart = () => {
    return div({ className: "absolute inset-0 flex flex-col items-center justify-center bg-black/80" }, 
      h2({ className: "text-2xl font-bold mb-4" }, "TERMINAL PONG"),
      p({ className: "mb-6" }, `First to ${WINNING_SCORE} wins`),
      button({ 
        onclick: game.initGame,
        className: "px-6 py-2 border border-green-500 rounded hover:bg-green-500/20 transition"
      }, "START GAME ::")
    );
  }

  const gameOverlayStop = () => {
    return div({ className: "absolute inset-0 flex flex-col items-center justify-center bg-black/80" }, 
      h2({ className: "text-2xl font-bold mb-2" }, `${game.state.winner} WINS!`),
      p({ className: "mb-2" }, `Final Score: ${game.state.playerScore} - ${game.state.computerScore}`),
      button({ 
        onclick: game.initGame,
        className: "px-6 py-2 border border-green-500 rounded hover:bg-green-500/20 transition mt-4"
      }, "PLAY AGAIN")
    );
  }

  const gameControls = () => {
    const Reset = () => {
      return button({ 
        onclick: () => {
          game.state.gameStarted = false;
        },
        className: "px-4 py-1 border border-green-500/50 rounded text-sm hover:bg-green-500/20 transition"
      }, "RESET");
    };

  return div({ className: "flex justify-between items-center mt-4" }, 
      div({ className: "text-sm" }, `PLAYER: ${game.state.playerScore}`),
      (game.state.gameStarted && !game.state.gameOver) ? Reset() : null,
      div({ className: "text-sm" }, `COMPUTER: ${game.state.computerScore}`)
    );
  }

  const pongInstructions = (winningScore:number) => {
    return div({ className: "mt-6 text-green-400/70 text-sm" }, 
      p({ className: "mb-1" }, "$ cat instructions.txt"),
      div({ className: "border border-green-500/20 p-2 rounded bg-black/50" }, 
        p({}, "- Move your mouse or finger to control the left paddle"),
        p({}, `- First player to reach ${winningScore} points wins`),
        p({}, "- The ball speeds up as the game progresses")
      )
    );
  }

  const pongFooter = () => {
    return div({ className: "mt-8 text-green-400/70 text-sm text-center" }, 
      `© ${new Date().getFullYear()} TERM_OS • All systems nominal`
    );
  }
  game.initGame()

  
  return TerminalBox("terminal@user:~/games/pong",
    pongGameTitle(),
    div({ className: "relative w-full", style: { height: "60vh" } },
      game.render(),
      (!game.state.gameStarted && !game.state.gameOver) ? gameOverlayStart() : null,
      game.state.gameOver ? gameOverlayStop() : null,
    ),
    gameControls(),
    pongInstructions(WINNING_SCORE),
    pongFooter(),
  );
}