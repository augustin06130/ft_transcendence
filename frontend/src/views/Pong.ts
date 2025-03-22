import { div, button, h1, h2, p } from "@framework/tags";
import TerminalBox from "@components/TerminalBox";
import PongGame, { WINNING_SCORE, gameModesType, gameModes } from "@components/Pong";
import UseState from "@framework/UseState";

export default function PongGameView() {
  const gameMode = UseState<gameModesType>('ai', (newValue, oldValue) => {
    console.log(`Game mode changed from ${oldValue} to ${newValue}`);
    game.setGameMode(newValue); // Mettre à jour gameMode dans PongGame
    updateModeSwitchText(); // Mettre à jour le texte du bouton
  });

  const game = new PongGame(gameMode.get()); // Passer gameMode à PongGame

  let modeSwitchButton: HTMLElement | null = null; // Référence au bouton ModeSwitch

  // Fonction pour mettre à jour le texte du bouton
  const updateModeSwitchText = () => {
    if (modeSwitchButton) {
      modeSwitchButton.textContent = "Mode " + gameMode.get();
    }
  };

  const pongGameTitle = () => {
    return div({ className: "text-center mb-4" },
      h1({ className: "text-2xl font-bold tracking-wider" }, "TERMINAL PONG"),
      p({ className: "text-green-400/70 text-sm" },
        gameMode.get() === 'ai'
          ? "Move your mouse or finger to control the left paddle"
          : "Use 'W' and 'S' to control the left paddle, and arrow keys for the right paddle"
      )
    );
  };

  const gameControls = () => {
    const Reset = button({
      onclick: () => {
        game.state.gameStarted = false;
      },
      className: "px-4 py-1 border border-green-500/50 rounded text-sm hover:bg-green-500/20 transition"
    }, "RESET");

    const ModeSwitch = button({
      onclick: () => {
		if (!game.state.gameStarted)
          gameMode.set(gameModes[(gameModes.indexOf(gameMode.get()) + 1) % gameModes.length]);
      },
      className: "px-4 py-1 border border-green-500/50 rounded text-sm hover:bg-green-500/20 transition"
    }, "Mode " + gameMode.get());

    // Stocker la référence au bouton ModeSwitch
    modeSwitchButton = ModeSwitch;

    return div({ className: "flex justify-between items-center mt-4" },
      div({ className: "text-sm" }, `PLAYER 1`),
      div({ className: "flex gap-2" },
        (game.state.gameStarted && !game.state.gameOver) ? Reset : null,
        ModeSwitch
      ),
      div({ className: "text-sm" }, `PLAYER 2`)
    );
  };

  // Gérer les contrôles pour le mode PvP
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'w' || e.key === 'W') {
      game.moveLeftPaddle(-10); // Déplacer le paddle gauche vers le haut
    } else if (e.key === 's' || e.key === 'S') {
      game.moveLeftPaddle(10); // Déplacer le paddle gauche vers le bas
    }
    if (gameMode.get() === 'pvp') {
      if (e.key === 'i' || e.key === 'I') {
        game.moveRightPaddle(-10); // Déplacer le paddle droit vers le haut
      } else if (e.key === 'k' || e.key === 'K') {
        game.moveRightPaddle(10); // Déplacer le paddle droit vers le bas
      }
    }
  };
  const pongInstructions = () => {
    return div({ className: "mt-6 text-green-400/70 text-sm" },
      p({ className: "mb-1" }, "$ cat instructions.txt"),
      div({ className: "border border-green-500/20 p-2 rounded bg-black/50" },
        p({}, gameMode.get() === 'ai'
          ? "- Move your mouse or finger to control the left paddle"
          : "- Use 'W' and 'S' to control the left paddle, and arrow keys for the right paddle"
        ),
        p({}, `- First player to reach ${WINNING_SCORE} points wins`),
        p({}, "- The ball speeds up as the game progresses")
      )
    );
  };

  const pongFooter = () => {
    return div({ className: "mt-8 text-green-400/70 text-sm text-center" },
      `© ${new Date().getFullYear()} TERM_OS • All systems nominal`
    );
  };

  window.addEventListener('keydown', handleKeyDown);

  // Fonction de rendu du composant
  const renderComponent = () => {
    return div({},
      pongGameTitle(),
      game.render(),
      gameControls(),
      pongInstructions(),
      pongFooter(),
    );
  };

  // Retourner le composant rendu
  return renderComponent();
}
