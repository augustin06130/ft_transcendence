// import { div, button, h1, h2, p } from "@framework/tags";
// import TerminalBox from "@components/TerminalBox";
// import PongGame, { WINNING_SCORE } from "@components/Pong";
// import UseState from "@framework/UseState";

// export default function PongGameView() {
//   const gameMode = UseState<'ai' | 'pvp'>('ai', (newValue, oldValue) => {
//     console.log(`Game mode changed from ${oldValue} to ${newValue}`);
//     game.setGameMode(newValue); // Mettre à jour gameMode dans PongGame
//     updateModeSwitchText(); // Mettre à jour le texte du bouton
//   });

//   const game = new PongGame(gameMode.get()); // Passer gameMode à PongGame

//   let modeSwitchButton: HTMLElement | null = null; // Référence au bouton ModeSwitch

//   // Fonction pour mettre à jour le texte du bouton
//   const updateModeSwitchText = () => {
//     if (modeSwitchButton) {
//       modeSwitchButton.textContent = gameMode.get() === 'ai' ? "Switch to PvP" : "Switch to AI";
//     }
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
//     // Create the Reset button
//     const Reset = button({
//       onclick: () => {
//         game.state.gameStarted = false;
//       },
//       className: "px-4 py-1 border border-green-500/50 rounded text-sm hover:bg-green-500/20 transition"
//     }, "RESET");

//     // Create the ModeSwitch button
//     const ModeSwitch = button({
//       onclick: () => {
//         // This correctly toggles the game mode
//         gameMode.set(gameMode.get() === 'ai' ? 'pvp' : 'ai');

//         // Force an immediate update to the UI for the Player 2 label
//         if (forceUpdate) forceUpdate();
//       },
//       className: "px-4 py-1 border border-green-500/50 rounded text-sm hover:bg-green-500/20 transition"
//     }, gameMode.get() === 'ai' ? "Switch to PvP" : "Switch to AI");

//     // Store reference to button if needed
//     modeSwitchButton = ModeSwitch;

//     // Create the player labels - these will be recreated on each render
//     const player1Label = div({ className: "text-sm" }, `PLAYER 1: ${game.state.playerScore}`);
//     const player2Label = div({ className: "text-sm" },
//       `${gameMode.get() === 'ai' ? "AI" : "Guest"}: ${game.state.computerScore}`
//     );

//     return div({ className: "flex flex-col items-center mt-4" }, // Centrer verticalement
//       div({ className: "flex justify-between w-full" }, // Conteneur pour les scores
//         player1Label,
//         player2Label
//       ),
//       div({ className: "flex justify-center w-full mt-4" }, // Centrer horizontalement
//         (game.state.gameStarted && !game.state.gameOver) ? Reset : null,
//         ModeSwitch
//       )
//     );
//   };
//   // Gérer les contrôles pour le mode PvP
//   const handleKeyDown = (e: KeyboardEvent) => {
//     if (gameMode.get() === 'pvp') {
//       if (e.key === 'w' || e.key === 'W') {
//         game.moveLeftPaddle(-10); // Déplacer le paddle gauche vers le haut
//       } else if (e.key === 's' || e.key === 'S') {
//         game.moveLeftPaddle(10); // Déplacer le paddle gauche vers le bas
//       } else if (e.key === 'i' || e.key === 'I') {
//         game.moveRightPaddle(-10); // Déplacer le paddle droit vers le haut
//       } else if (e.key === 'k' || e.key === 'K') {
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

//   // Retourner le composant rendu
//   return renderComponent();
// }
import { div, button, h1, h2, p } from "@framework/tags";
import TerminalBox from "@components/TerminalBox";
import PongGame, { WINNING_SCORE } from "@components/Pong";
import UseState from "@framework/UseState";

export default function PongGameView() {
  let modeSwitchButton: HTMLElement | null = null;
  let player2Label: HTMLElement | null = null;

  const gameMode = UseState<'ai' | 'pvp'>('ai', (newValue, oldValue) => {
    console.log(`Game mode changed from ${oldValue} to ${newValue}`);
    game.setGameMode(newValue);
    game.reset();

    // Directly update the button text
    if (modeSwitchButton) {
      modeSwitchButton.textContent = newValue === 'ai' ? "Switch to PvP" : "Switch to AI";
    }

    // Directly update the player 2 label
    if (player2Label) {
      player2Label.textContent = `${newValue === 'ai' ? "AI" : "Guest"}: ${game.state.computerScore}`;
    }
  });

  const game = new PongGame(gameMode.get());

  const pongGameTitle = () => {
    return div({ className: "text-center mb-4" },
      h1({ className: "text-2xl font-bold tracking-wider" }, "TERMINAL PONG"),
      p({ className: "text-green-400/70 text-sm" },
        gameMode.get() === 'ai'
          ? "Move your mouse or finger to control the left paddle"
          : "Use 'W' and 'S' to control the left paddle, and 'I' and 'K' for the right paddle"
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

    // Create the mode switch button and store a reference to it
    const ModeSwitch = button({
      onclick: () => {
        gameMode.set(gameMode.get() === 'ai' ? 'pvp' : 'ai');
      },
      className: "px-4 py-1 border border-green-500/50 rounded text-sm hover:bg-green-500/20 transition",
      event: {
        onMounted: (e: Event) => {
          modeSwitchButton = e.target as HTMLElement; // Store reference to the button element
        }
      }
    }, gameMode.get() === 'ai' ? "Switch to PvP" : "Switch to AI");

    // Create player 2 label and store a reference to it
    const player2LabelEl = div({
      className: "text-sm",
      event: {
        onMounted: (e: Event) => {
          player2Label = e.target as HTMLElement; // Store reference to the label element
        }
      }
    }, `${gameMode.get() === 'ai' ? "AI" : "Guest"}: ${game.state.computerScore}`);

    return div({ className: "flex flex-col items-center mt-4" },
      div({ className: "flex justify-between w-full" },
        div({ className: "text-sm" }, `PLAYER 1: ${game.state.playerScore}`),
        player2LabelEl
      ),
      div({ className: "flex justify-center w-full mt-4 gap-2" },
        (game.state.gameStarted && !game.state.gameOver) ? Reset : null,
        ModeSwitch
      )
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
