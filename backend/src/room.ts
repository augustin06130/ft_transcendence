import { FastifyReply, FastifyRequest } from 'fastify';
import { WebSocket } from '@fastify/websocket';
import PongGame from './pong';

const pongRooms = new Map<string, PongGame>();

export function create_room(_: FastifyRequest, reply: FastifyReply) {
	let roomId = Math.floor(Math.random() * 9999)
		.toString()
		.padStart(4, '0');
	console.log('roomId', roomId);
	pongRooms.set(roomId, new PongGame(() => pongRooms.delete(roomId)));
	reply.send({ roomId: roomId });
}

export function validate_roomId(request: FastifyRequest, reply: FastifyReply) {
	const { roomId } = request.body as { roomId: string };
	console.log('validating', roomId, pongRooms.has(roomId));
	reply.code(pongRooms.has(roomId) ? 200 : 204).send();
}

export function join_room(socket: WebSocket, request: FastifyRequest) {
	socket.on('message', (msg: any) => {
		const data = JSON.parse(msg);
		if (data.cmd !== 'roomId' || !pongRooms.has(data.arg0)) {
			return
		};
		pongRooms.get(data.arg0)?.joinGame(socket, request);
	});
	socket.on('close', () => console.log("game counts:", pongRooms.size));
}

export function get_tree(request: FastifyRequest, reply: FastifyReply) {
	const { roomId } = request.body as { roomId: string };
	reply.header('Content-Type', 'text/plain');
	if (pongRooms.get(roomId)?.tournament.mode === 'remote') {
		reply.send(pongRooms.get(roomId)?.tournamentTree());
	}
	else {
		reply.code(412).send()
	}
}

