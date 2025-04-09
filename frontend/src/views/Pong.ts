import PongGame, { WINNING_SCORE  } from '@components/Pong';
import { GameMode } from 'types';
import TournamentOverlay from '@components/TournamenOverlay';
import { div, button, p, h1 } from '@framework/tags';
import UseState from '@framework/UseState';
import popOver from '@components/PopOver';
import { roomId } from './Room';

export let game: PongGame | null = null;

export default function PongGameView() {
    let modeSwitchButton: HTMLElement | null = null;
    let player2NameLabel: HTMLElement | null = null;
    let player1NameLabel: HTMLElement | null = null;
    let topLabel: HTMLElement | null = null;
    let tournamentOverlay: TournamentOverlay = new TournamentOverlay();

    const gameMode = UseState<GameMode>('ai', (newValue, _) => {
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

    if (game) game.close();
    game = new PongGame(gameMode, p1Name.set, p2Name.set, topText.set);

    const pongGameTitle = () => {
        topLabel = p({ className: 'text-green-400/70 text-sm' });
        return div(
            { className: 'text-center mb-4' },
            h1({ className: 'text-2xl font-bold tracking-wider' }, `Room id: ${roomId.get()}`),
            topLabel
        );
    };

    const gameControls = () => {
        modeSwitchButton = button(
            {
                onclick: () => game?.sendCmd('mode'),
                className:
                    'px-4 py-1 border border-green-500/50 rounded text-sm hover:bg-green-500/20 transition',
            },
            'Mode ' + gameMode.get()
        );

        player1NameLabel = div({ className: 'text-sm' }, 'Player 1');
        player2NameLabel = div({ className: 'text-sm' }, 'Player 2');
        const buttonTournament = button(
            {
                className:
                    'px-4 py-1 border border-green-500/50 rounded text-sm hover:bg-green-500/20 transition',
                onclick: fectchTournamentTree,
            },
            'view tournament'
        );

        return div(
            { className: 'flex justify-between items-center mt-4' },
            player1NameLabel,
            div({ className: 'flex gap-2' }, modeSwitchButton),
            div({ className: 'flex gap-2' }, buttonTournament),
            player2NameLabel
        );
    };

    const fectchTournamentTree = () => {
        const url = new URL('/api/tournament', window.location.href);
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId: roomId.get() }),
        })
            .then(resp => {
                if (resp.status === 412) throw 'Not in tournament mode';
                if (!resp.ok) throw 'Connection failed';
                return resp.text();
            })
            .then(html => {
                tournamentOverlay.show();
                console.log(html);
                tournamentOverlay.setHtml(html);
            })
            .catch(r => popOver.show(r));
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
        return div(
            { className: 'mt-8 text-green-400/70 text-sm text-center' },
            `© ${new Date().getFullYear()} TERM_OS • All systems nominal`
        );
    };

    const renderComponent = () => {
        return div(
            {},
            pongGameTitle(),
            game?.render(),
            gameControls(),
            pongInstructions(),
            pongFooter(),
            tournamentOverlay.render()
        );
    };

    return renderComponent();
}
