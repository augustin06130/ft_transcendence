import { div, p, form, input } from '@framework/tags';
import TerminalBox, { footer } from '@components/TerminalBox';
import UseState from '@framework/UseState';
import { State } from '@framework/types';
import { renderApp } from 'main';

export const roomId = UseState<string>('');

function LoginForm(
    joinHandler: (e: Event) => void,
    createHandler: (e: Event) => void,
    roomCode: State<string>
) {
    return form(
        {
            className: 'space-y-4',
        },
        input({
            id: 'submit',
            type: 'button',
            value: 'Create Room',
            className: 'w-full py-2 border border-green-500 text-green-500 hover:bg-green-500/20',
            onclick: createHandler,
        }),
        div({
            className: 'mt-6 text-green-400/70 text-xs border-t border-green-500/30 pt-4',
        }),
        input({
            id: 'roomCode',
            type: 'text',
            name: 'roomCode',
            className: 'w-full bg-black border border-green-500/30 p-2 text-green-500',
            placeholder: 'CODE',
            value: roomCode.get(),
            event: {
                input: e => {
                    const input = e.target as HTMLInputElement;
                    const value = input.value.toUpperCase();
                    input!.value = value;
                    roomCode.set(value);
                },
            },
        }),
        input({
            id: 'submit',
            type: 'button',
            value: 'Join Room',
            className: 'w-full py-2 border border-green-500 text-green-500 hover:bg-green-500/20',
            onclick: joinHandler,
        })
    );
}

export default function Room() {
    const roomCode = UseState('', () => {});
    const isMounted = UseState(false, () => {});
    const error = UseState('', () => {});

    const handleMount = () => {
        isMounted.set(true);
        return () => {
            isMounted.set(false);
        };
    };

    handleMount();

    function createHandler(_: Event) {
        error.set('');
        fetch('/create-room', {
            method: 'GET',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Connexion failed');
                }
                return response.json();
            })
            .then(data => {
                join(data.roomId);
            })
            .catch(err => {
                console.error(err);
                error.set(err.message);
            });
    }

    function joinHandler(_: Event) {
        error.set('');
        if (!roomCode.get()) {
            return error.set('ERROR: no code');
        }
        if (roomCode.get().length !== 4) {
            return error.set('ERROR: invalid code length');
        }
        join(roomCode.get());
    }

    function join(id: string) {
        roomId.set(id);
        window.dispatchEvent(new CustomEvent('url', { detail: { to: '/pong' } }));
        renderApp();
    }

    const formContent = LoginForm(joinHandler, createHandler, roomCode);

    return TerminalBox(
        'terminal@user:~/pong sudo usermod -a -G',
        div(
            {
                className: `mx-auto max-w-md border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10 transition-opacity duration-500 ${isMounted.get() ? 'opacity-100' : 'opacity-0'}`,
            },
            div(
                { className: 'text-center mb-6' },
                p({ className: 'text-2xl font-bold tracking-wider' }, 'JOIN ROOM'),
                p(
                    { className: 'text-green-400/70 text-sm mt-1' },
                    'Enter a room to join or create a new room'
                )
            ),
            formContent,
            div(
                { className: 'mt-6 text-green-400/70 text-xs border-t border-green-500/30 pt-4' },
                p({}, `$ Last update: ${new Date().toLocaleString()}`),
                p({}, '$ System status: Online')
            )
        ),
        footer()
    );
}
