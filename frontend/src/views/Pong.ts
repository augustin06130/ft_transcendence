import { div, button, h1, p } from '@framework/tags';
import PongGame, { WINNING_SCORE, GameModeType } from '@components/Pong';
import UseState from '@framework/UseState';

export default function PongGameView() {
    let modeSwitchButton: HTMLElement | null = null;
    let player2NameLabel: HTMLElement | null = null;
    let player1NameLabel: HTMLElement | null = null;
    let topLabel: HTMLElement | null = null;

    const gameMode = UseState<GameModeType>('local', (newValue, _) => {
        if (modeSwitchButton) modeSwitchButton.textContent = 'Mode ' + newValue;
    });

    const p1Name = UseState<string>('Player 1', (newValue, _) => {
        if (player1NameLabel) player1NameLabel.innerHTML = newValue;
    });

    const p2Name = UseState<string>('Player 2', (newValue, _) => {
        if (player2NameLabel) player2NameLabel.innerHTML = newValue;
    });

    const topText = UseState<string>('Welcome', (newValue, _) => {
        if (topLabel) {
            topLabel.innerHTML = newValue;
        }
    });

    const pongGameTitle = () => {
        topLabel = p({ className: 'text-green-400/70 text-sm' });
        return div({ className: 'text-center mb-4' }, h1({ className: 'text-2xl font-bold tracking-wider' }, 'TERMINAL PONG'), topLabel);
    };

    const game = new PongGame(gameMode, p1Name.set, p2Name.set, topText.set);

    const gameControls = () => {
        modeSwitchButton = button(
            {
                onclick: () => game.sendCmd('mode'),
                className: 'px-4 py-1 border border-green-500/50 rounded text-sm hover:bg-green-500/20 transition',
            },
            'Mode ' + gameMode.get()
        );

        player1NameLabel = div({ className: 'text-sm' }, 'Player 1');
        player2NameLabel = div({ className: 'text-sm' }, 'Player 2');

        return div(
            { className: 'flex justify-between items-center mt-4' },
            player1NameLabel,
            div({ className: 'flex gap-2' }, modeSwitchButton),
            player2NameLabel
        );
    };

    const pongInstructions = () => {
        return div(
            { className: 'mt-6 text-green-400/70 text-sm' },
            p({ className: 'mb-1' }, '$ cat instructions.txt'),
            div(
                {
                    className: 'border border-green-500/20 p-2 rounded bg-black/50',
                },
                p({}, "- 'W' or 'S' to move the left paddle"),
                p({}, "- 'I' or 'K' to move the right paddle"),
                p({}, `- First player to reach ${WINNING_SCORE} points wins`),
                p({}, '- The ball speeds up as the game progresses')
            )
        );
    };

    const pongFooter = () => {
        return div({ className: 'mt-8 text-green-400/70 text-sm text-center' }, `© ${new Date().getFullYear()} TERM_OS • All systems nominal`);
    };

    const renderComponent = () => {
        return div({}, pongGameTitle(), game.render(), gameControls(), pongInstructions(), pongFooter());
    };

    return renderComponent();
}
