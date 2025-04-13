import { FastifyReply, FastifyRequest } from 'fastify';
import { onlineUserStatus } from './onlineUsers';
import { WebSocket } from '@fastify/websocket';
import PongGame from './pong';
import { sendSuccess } from './routes';

const pongRooms = new Map<string, PongGame>();

export function create_room(_: FastifyRequest, reply: FastifyReply) {
	let roomId = '4242';
	while (pongRooms.has(roomId)) {
		roomId = Math.floor(Math.random() * 9999)
			.toString()
			.padStart(4, '0');
	}

	pongRooms.set(roomId, new PongGame(() => pongRooms.delete(roomId)));
	sendSuccess(reply, 200, { roomId: roomId })
}

export function validate_roomId(request: FastifyRequest, reply: FastifyReply) {
	const { roomId } = request.body as { roomId: string };
	if (!pongRooms.has(roomId))
		throw { code: 404, message: 'Game not found' }
	sendSuccess(reply, 200)
}

export async function join_room(socket: WebSocket, request: FastifyRequest) {
	socket.on('message', (msg: any) => {
		const data = JSON.parse(msg);
		if (data.cmd !== 'roomId' || !pongRooms.has(data.arg0)) {
			return;
		}
		pongRooms.get(data.arg0)?.joinGame(socket, request,);

		if ((request.user as any).username in onlineUserStatus) {
			onlineUserStatus[(request.user as any).username].status = data.arg0;
		}
	});
}

export function get_tree(request: FastifyRequest, reply: FastifyReply) {
	const { roomId } = request.body as { roomId: string };
	reply.header('Content-Type', 'text/plain');
	if (pongRooms.get(roomId)?.tournament.mode === 'remote') {
		sendSuccess(reply, 200, { roomId: pongRooms.get(roomId)?.tournamentTree() })
		reply.send();
	} else {
		throw ({ code: 412, message: 'ERROR: not in tournament mode' })
	}
}
