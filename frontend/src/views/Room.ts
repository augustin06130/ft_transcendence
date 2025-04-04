import { div, p, form, input } from '@framework/tags';
import TerminalBox, { BoxFooter} from '@components/TerminalBox';
import UseState from '@framework/UseState';
import { State } from '@framework/types';
import { switchPage } from '@framework/Router';
import popOver from '@components/PopOver';

export const roomId = UseState<string>('');

function RoomForm(
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
	const roomCode = UseState('', () => { });
	const isMounted = UseState(false, () => { });

	const handleMount = () => {
		isMounted.set(true);
		return () => {
			isMounted.set(false);
		};
	};

	handleMount();

	function createHandler(_: Event) {
		fetch('/api/room', {
			method: 'GET',
		})
			.then(response => {
				if (!response.ok) {
					throw new Error('Connexion failed');
				}
				return response.json();
			})
			.then(data => {
				roomId.set(data.roomId);
				switchPage('/pong');
			})
			.catch(err => popOver.show(err));
	}

	function joinHandler(_: Event) {
		if (!roomCode.get() || roomCode.get().length !== 4) {
			return popOver.show('Invalid Room Id');
		}

		fetch('/api/room', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				roomId: roomCode.get(),
			}),
		}).then(response => {
			if (!response.ok) {
				popOver.show('Connexion failed');
			} else if (response.status == 204) {
				popOver.show('Game not found');
			} else {
				roomId.set(roomCode.get());
				switchPage('/pong');
			}
		});
	}

	const formContent = RoomForm(joinHandler, createHandler, roomCode);

	return TerminalBox(
		'pong sudo usermod -a -G',
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
			BoxFooter(),
		),
	);
}
