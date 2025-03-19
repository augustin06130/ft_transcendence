import { div, button, h1, h2, p } from "@framework/tags";
import TerminalBox from "@components/TerminalBox";

import PongGame, { WINNING_SCORE } from "@components/Pong";

export default function PongGameView () {
  const game = new PongGame()

  const pongGameTitle = () => {
    return div({ className: "text-center mb-4" },
      h1({ className: "text-2xl font-bold tracking-wider" }, "TERMINAL PONG"),
      p({ className: "text-green-400/70 text-sm" }, "Move your mouse or finger to control the left paddle")
    );
  }

  const gameControls = () => {
    const Reset = button({
      onclick: () => {
        game.state.gameStarted = false;
      },
      className: "px-4 py-1 border border-green-500/50 rounded text-sm hover:bg-green-500/20 transition"
    }, "RESET");


  return div({ className: "flex justify-between items-center mt-4" },
      div({ className: "text-sm" }, `PLAYER: ${game.state.playerScore}`),
      (game.state.gameStarted && !game.state.gameOver) ? Reset : null,
      div({ className: "text-sm" }, `COMPUTER: ${game.state.computerScore}`)
    );
  }

  const pongInstructions = () => {
    return div({ className: "mt-6 text-green-400/70 text-sm" },
      p({ className: "mb-1" }, "$ cat instructions.txt"),
      div({ className: "border border-green-500/20 p-2 rounded bg-black/50" },
        p({}, "- Move your mouse or finger to control the left paddle"),
        p({}, `- First player to reach ${WINNING_SCORE} points wins`),
        p({}, "- The ball speeds up as the game progresses")
      )
    );
  }

  const pongFooter = () => {
    return div({ className: "mt-8 text-green-400/70 text-sm text-center" },
      `© ${new Date().getFullYear()} TERM_OS • All systems nominal`
    );
  }

  return div({},
    pongGameTitle(),
    game.render(),
    gameControls(),
    pongInstructions(),
    pongFooter(),
  );
}
