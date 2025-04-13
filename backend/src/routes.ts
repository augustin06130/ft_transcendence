import { deleteUser, getProfile, getUsernameList, isUser, setCookie, updateProfile, updateProfileImage } from './user';
import { create_room, validate_roomId, get_tree, join_room } from './room';
import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { confirmTfa, enableTfa, loginTfa, removeTfa } from './tfa';
import { getMatches, getMatchesCount, getStats } from './matches';
import { addFriend, getFriends, removeFriend } from './friends';
import { loginPass, registerPass } from './login';
import setupStaticLocations from './static';
import { handleGoogle } from './googleAuth';
import { updatePass } from './login';
import { logoutUser } from './auth';

export function sendSuccess(reply: FastifyReply, code: number = 200, response: { [key: string]: any } = {}) {
	response['success'] = true;
	reply.code(code).send(response);
}

export default function addFastifyRoutes(fastify: FastifyInstance) {

	function addPost(route: string, handler: (request: FastifyRequest, reply: FastifyReply) => any) {
		fastify.post(route, async (request, reply) => {
			await execHandler(request, reply, handler);
		});
	}

	function addGet(route: string, handler: (request: FastifyRequest, reply: FastifyReply) => any) {
		fastify.get(route, async (request, reply) => {
			await execHandler(request, reply, handler);
		});
	}

	async function execHandler(request: FastifyRequest, reply: FastifyReply, handler: (request: FastifyRequest, reply: FastifyReply) => any) {
		try {
			await handler(request, reply);
		} catch (err: any) {
			err['succes'] = false;
			console.error(err);
			reply.code(err.code || 400).send(err);
		}
	}

	fastify.get('/pong', (_, rep) => rep.redirect('/room'));

	addGet('/api/stats', getStats);
	addGet('/api/matches', getMatches);
	addGet('/api/matches/count', getMatchesCount);

	addGet('/api/friend/all', getFriends);
	addPost('/api/friend/add', addFriend);
	addPost('/api/friend/remove', removeFriend);

	addGet('/api/room', create_room);
	addPost('/api/room', validate_roomId);
	addPost('/api/tournament', get_tree);

	addGet('/api/user', isUser);
	addGet('/api/profile', getProfile);
	addPost('/api/profile', updateProfile);
	addPost('/api/profile/pass', updatePass);
	addPost('/api/profile/image', updateProfileImage);
	addGet('/api/profile/list', getUsernameList);
	addGet('/api/profile/delete', deleteUser);

	addPost('/api/register', registerPass);
	addPost('/api/login/pass', loginPass);
	addPost('/api/login/google', handleGoogle);
	addGet('/api/logout', logoutUser);

	addGet('/api/tfa/add', enableTfa);
	addPost('/api/tfa/verify', confirmTfa);
	addPost('/api/tfa/login', loginTfa);
	addGet('/api/tfa/remove', removeTfa);

	addGet('/api/cookies', setCookie);

	fastify.register(async fastify => {
		fastify.get('/api/pong', { websocket: true }, join_room);
	});

	setupStaticLocations(fastify, ['/style.css', '/output.css', '/bundle.js', '/favicon.ico']);
}
