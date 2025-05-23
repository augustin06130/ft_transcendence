import { div, p, form, input } from '@framework/tags';
import { switchPage } from '@framework/Router';
import UseState from '@framework/UseState';
import popOver from '@components/PopOver';
import { State } from '@framework/types';

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
			inputMode: 'numeric',
			pattern: '[0-9]*',
			maxLength: 4,
			minLength: 4,
			className:
				'w-full bg-black border border-green-500/30 p-2 text-green-500 focus:outline-none text-center',
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
		const url = new URL('/api/room', window.location.href);
		fetch(url, {
			method: 'GET',
		})
			.then(resp => resp.json())
			.then(json => {
				if (!json.success)
					throw json.message;
				switchPage('/pong', json.roomId);
			})
			.catch(err => popOver.show(err));
	}

	function joinHandler(_: Event) {
		if (!roomCode.get() || roomCode.get().length !== 4) {
			return popOver.show('Invalid Room Id');
		}
		const url = new URL('/api/room', window.location.href);
		fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				roomId: roomCode.get(),
			}),
		}).then(resp => resp.json())
			.then(json => {
				if (!json.success)
					throw json.message;
				switchPage('/pong', roomCode.get());
			})
			.catch(err => popOver.show(err));
	}

	return div(
		{},
		div(
			{ className: 'text-center mb-6' },
			p({ className: 'text-2xl font-bold tracking-wider' }, 'JOIN ROOM'),
			p(
				{ className: 'text-green-400/70 text-sm mt-1' },
				'Enter a room to join or create a new room'
			)
		),
		RoomForm(joinHandler, createHandler, roomCode)
	);
}
