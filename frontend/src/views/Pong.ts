// import { div, button, h1, h2, p } from "@framework/tags";
// import TerminalBox from "@components/TerminalBox";

// import PongGame, { WINNING_SCORE } from "@components/Pong";

// export default function PongGameView () {
//   const game = new PongGame()

//   const pongGameTitle = () => {
//     return div({ className: "text-center mb-4" },
//       h1({ className: "text-2xl font-bold tracking-wider" }, "TERMINAL PONG"),
//       p({ className: "text-green-400/70 text-sm" }, "Move your mouse or finger to control the left paddle")
//     );
//   }

//   const gameControls = () => {
//     const Reset = button({
//       onclick: () => {
//         game.state.gameStarted = false;
//       },
//       className: "px-4 py-1 border border-green-500/50 rounded text-sm hover:bg-green-500/20 transition"
//     }, "RESET");


//   return div({ className: "flex justify-between items-center mt-4" },
//       div({ className: "text-sm" }, `PLAYER: ${game.state.playerScore}`),
//       (game.state.gameStarted && !game.state.gameOver) ? Reset : null,
//       div({ className: "text-sm" }, `COMPUTER: ${game.state.computerScore}`)
//     );
//   }

//   const pongInstructions = () => {
//     return div({ className: "mt-6 text-green-400/70 text-sm" },
//       p({ className: "mb-1" }, "$ cat instructions.txt"),
//       div({ className: "border border-green-500/20 p-2 rounded bg-black/50" },
//         p({}, "- Move your mouse or finger to control the left paddle"),
//         p({}, `- First player to reach ${WINNING_SCORE} points wins`),
//         p({}, "- The ball speeds up as the game progresses")
//       )
//     );
//   }

//   const pongFooter = () => {
//     return div({ className: "mt-8 text-green-400/70 text-sm text-center" },
//       `© ${new Date().getFullYear()} TERM_OS • All systems nominal`
//     );
//   }

//   return div({},
//     pongGameTitle(),
//     game.render(),
//     gameControls(),
//     pongInstructions(),
//     pongFooter(),
//   );
// }

















// import { div, button, h1, h2, p } from "@framework/tags";
// import TerminalBox from "@components/TerminalBox";
// import PongGame, { WINNING_SCORE } from "@components/Pong";
// import UseState from "@framework/UseState";

// let forceUpdate: () => void;

// export default function PongGameView() {
//   const game = new PongGame();
//   const gameMode = UseState<'ai' | 'pvp'>('ai', (newValue, oldValue) => {
//     console.log(`Game mode changed from ${oldValue} to ${newValue}`);
//     game.reset();
//     if (forceUpdate) forceUpdate(); // Forcer la mise à jour du rendu
//   });

//   // Fonction pour forcer la mise à jour du rendu
//   forceUpdate = () => {
//     // Implémentez la logique pour forcer le re-rendu ici
//     // Cela dépend de votre framework
//   };


//   const pongGameTitle = () => {
//     return div({ className: "text-center mb-4" },
//       h1({ className: "text-2xl font-bold tracking-wider" }, "TERMINAL PONG"),
//       p({ className: "text-green-400/70 text-sm" },
//         gameMode.get() === 'ai'
//           ? "Move your mouse or finger to control the left paddle"
//           : "Use 'W' and 'S' to control the left paddle, and arrow keys for the right paddle"
//       )
//     );
//   };

//   const gameControls = () => {
//     const Reset = button({
//       onclick: () => {
//         game.state.gameStarted = false;
//       },
//       className: "px-4 py-1 border border-green-500/50 rounded text-sm hover:bg-green-500/20 transition"
//     }, "RESET");

//     const ModeSwitch = button({
//       onclick: () => {
//         gameMode.set(gameMode.get() === 'ai' ? 'pvp' : 'ai'); // Utiliser .get() et .set()
//         game.reset();
//       },
//       className: "px-4 py-1 border border-green-500/50 rounded text-sm hover:bg-green-500/20 transition"
//     }, gameMode.get() === 'ai' ? "Switch to PvP" : "Switch to AI");

//     return div({ className: "flex justify-between items-center mt-4" },
//       div({ className: "text-sm" }, `PLAYER 1: ${game.state.playerScore}`),
//       div({ className: "flex gap-2" },
//         (game.state.gameStarted && !game.state.gameOver) ? Reset : null,
//         ModeSwitch
//       ),
//       div({ className: "text-sm" }, `PLAYER 2: ${game.state.computerScore}`)
//     );
//   };

//   // Gérer les contrôles pour le mode PvP
//   const handleKeyDown = (e: KeyboardEvent) => {
//     if (gameMode.get() === 'pvp') {
//       if (e.key === 'w' || e.key === 'W') {
//         game.moveLeftPaddle(-10); // Déplacer le paddle gauche vers le haut
//       } else if (e.key === 's' || e.key === 'S') {
//         game.moveLeftPaddle(10); // Déplacer le paddle gauche vers le bas
//       } else if (e.key === 'ArrowUp') {
//         game.moveRightPaddle(-10); // Déplacer le paddle droit vers le haut
//       } else if (e.key === 'ArrowDown') {
//         game.moveRightPaddle(10); // Déplacer le paddle droit vers le bas
//       }
//     }
//   };

//   const pongInstructions = () => {
//     return div({ className: "mt-6 text-green-400/70 text-sm" },
//       p({ className: "mb-1" }, "$ cat instructions.txt"),
//       div({ className: "border border-green-500/20 p-2 rounded bg-black/50" },
//         p({}, gameMode.get() === 'ai'
//         ? "- Move your mouse or finger to control the left paddle"
//         : "- Use 'W' and 'S' to control the left paddle, and arrow keys for the right paddle"
//         ),
//         p({}, `- First player to reach ${WINNING_SCORE} points wins`),
//         p({}, "- The ball speeds up as the game progresses")
//       )
//     );
//   }

//   const pongFooter = () => {
//     return div({ className: "mt-8 text-green-400/70 text-sm text-center" },
//       `© ${new Date().getFullYear()} TERM_OS • All systems nominal`
//     );
//   }

//   window.addEventListener('keydown', handleKeyDown);
//   return div({},
//     pongGameTitle(),
//     game.render(),
//     gameControls(),
//     pongInstructions(),
//     pongFooter(),
//   );
// }












// import { div, button, h1, h2, p } from "@framework/tags";
// import TerminalBox from "@components/TerminalBox";
// import PongGame, { WINNING_SCORE } from "@components/Pong";
// import UseState from "@framework/UseState";

// let forceUpdate: () => void;

// export default function PongGameView() {
//   const gameMode = UseState<'ai' | 'pvp'>('ai', (newValue, oldValue) => {
//     console.log(`Game mode changed from ${oldValue} to ${newValue}`);
//     game.setGameMode(newValue); // Mettre à jour gameMode dans PongGame
//     game.reset(); // Réinitialiser le jeu lorsque le mode change
//     if (forceUpdate) forceUpdate(); // Forcer la mise à jour du rendu
//   });

//   const game = new PongGame(gameMode.get()); // Passer gameMode à PongGame

//   // Fonction pour forcer la mise à jour du rendu
//   forceUpdate = () => {
//     // Implémentez la logique pour forcer le re-rendu ici
//     // Cela dépend de votre framework
//   };

//   const pongGameTitle = () => {
//     return div({ className: "text-center mb-4" },
//       h1({ className: "text-2xl font-bold tracking-wider" }, "TERMINAL PONG"),
//       p({ className: "text-green-400/70 text-sm" },
//         gameMode.get() === 'ai'
//           ? "Move your mouse or finger to control the left paddle"
//           : "Use 'W' and 'S' to control the left paddle, and arrow keys for the right paddle"
//       )
//     );
//   };

//   const gameControls = () => {
//     const Reset = button({
//       onclick: () => {
//         game.state.gameStarted = false;
//       },
//       className: "px-4 py-1 border border-green-500/50 rounded text-sm hover:bg-green-500/20 transition"
//     }, "RESET");

//     const ModeSwitch = button({
//       onclick: () => {
//         gameMode.set(gameMode.get() === 'ai' ? 'pvp' : 'ai'); // Utiliser .get() et .set()
//       },
//       className: "px-4 py-1 border border-green-500/50 rounded text-sm hover:bg-green-500/20 transition"
//     }, gameMode.get() === 'ai' ? "Switch to PvP" : "Switch to AI");

//     return div({ className: "flex justify-between items-center mt-4" },
//       div({ className: "text-sm" }, `PLAYER 1: ${game.state.playerScore}`),
//       div({ className: "flex gap-2" },
//         (game.state.gameStarted && !game.state.gameOver) ? Reset : null,
//         ModeSwitch
//       ),
//       div({ className: "text-sm" }, `PLAYER 2: ${game.state.computerScore}`)
//     );
//   };

//   // Gérer les contrôles pour le mode PvP
//   const handleKeyDown = (e: KeyboardEvent) => {
//     if (gameMode.get() === 'pvp') {
//       if (e.key === 'w' || e.key === 'W') {
//         game.moveLeftPaddle(-10); // Déplacer le paddle gauche vers le haut
//       } else if (e.key === 's' || e.key === 'S') {
//         game.moveLeftPaddle(10); // Déplacer le paddle gauche vers le bas
//       } else if (e.key === 'ArrowUp') {
//         game.moveRightPaddle(-10); // Déplacer le paddle droit vers le haut
//       } else if (e.key === 'ArrowDown') {
//         game.moveRightPaddle(10); // Déplacer le paddle droit vers le bas
//       }
//     }
//   };

//   const pongInstructions = () => {
//     return div({ className: "mt-6 text-green-400/70 text-sm" },
//       p({ className: "mb-1" }, "$ cat instructions.txt"),
//       div({ className: "border border-green-500/20 p-2 rounded bg-black/50" },
//         p({}, gameMode.get() === 'ai'
//           ? "- Move your mouse or finger to control the left paddle"
//           : "- Use 'W' and 'S' to control the left paddle, and arrow keys for the right paddle"
//         ),
//         p({}, `- First player to reach ${WINNING_SCORE} points wins`),
//         p({}, "- The ball speeds up as the game progresses")
//       )
//     );
//   };

//   const pongFooter = () => {
//     return div({ className: "mt-8 text-green-400/70 text-sm text-center" },
//       `© ${new Date().getFullYear()} TERM_OS • All systems nominal`
//     );
//   };

//   window.addEventListener('keydown', handleKeyDown);

//   // Fonction de rendu du composant
//   const renderComponent = () => {
//     return div({},
//       pongGameTitle(),
//       game.render(),
//       gameControls(),
//       pongInstructions(),
//       pongFooter(),
//     );
//   };

//   // Enregistrer le composant pour le re-rendu automatique
//   return renderComponent();
// }









import { div, button, h1, h2, p } from "@framework/tags";
import TerminalBox from "@components/TerminalBox";
import PongGame, { WINNING_SCORE } from "@components/Pong";
import UseState from "@framework/UseState";

export default function PongGameView() {
  const gameMode = UseState<'ai' | 'pvp'>('ai', (newValue, oldValue) => {
    console.log(`Game mode changed from ${oldValue} to ${newValue}`);
    game.setGameMode(newValue); // Mettre à jour gameMode dans PongGame
    updateModeSwitchText(); // Mettre à jour le texte du bouton
  });

  const game = new PongGame(gameMode.get()); // Passer gameMode à PongGame

  let modeSwitchButton: HTMLElement | null = null; // Référence au bouton ModeSwitch

  // Fonction pour mettre à jour le texte du bouton
  const updateModeSwitchText = () => {
    if (modeSwitchButton) {
      modeSwitchButton.textContent = gameMode.get() === 'ai' ? "Switch to PvP" : "Switch to AI";
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
        gameMode.set(gameMode.get() === 'ai' ? 'pvp' : 'ai'); // Utiliser .get() et .set()
      },
      className: "px-4 py-1 border border-green-500/50 rounded text-sm hover:bg-green-500/20 transition"
    }, gameMode.get() === 'ai' ? "Switch to PvP" : "Switch to AI");

    // Stocker la référence au bouton ModeSwitch
    modeSwitchButton = ModeSwitch;

    return div({ className: "flex justify-between items-center mt-4" },
      div({ className: "text-sm" }, `PLAYER 1: ${game.state.playerScore}`),
      div({ className: "flex gap-2" },
        (game.state.gameStarted && !game.state.gameOver) ? Reset : null,
        ModeSwitch
      ),
      div({ className: "text-sm" }, `PLAYER 2: ${game.state.computerScore}`)
    );
  };

  // Gérer les contrôles pour le mode PvP
  const handleKeyDown = (e: KeyboardEvent) => {
    if (gameMode.get() === 'pvp') {
      if (e.key === 'w' || e.key === 'W') {
        game.moveLeftPaddle(-10); // Déplacer le paddle gauche vers le haut
      } else if (e.key === 's' || e.key === 'S') {
        game.moveLeftPaddle(10); // Déplacer le paddle gauche vers le bas
      } else if (e.key === 'i' || e.key === 'I') {
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
