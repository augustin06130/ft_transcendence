import { FastifyReply, FastifyRequest } from "fastify";
import { onlineUserStatus } from "./onlineUsers";
import { updateUserDeletionDate } from "./user";
import { sendSuccess } from "./routes";
import { getUserBy } from "./user";
import { fastify } from "./main";
import { htoms } from "./utils";
import { User } from "./types";

export async function loginUser(id: number, reply: FastifyReply, tfa = true) {
	const user = await getUserBy('id', id);
	if (!user) {
		throw { code: 403, message: 'User not found' };
	}

	if (user.username in onlineUserStatus) {
		onlineUserStatus[user.username].status = 'online';
	}
	updateUserDeletionDate(user.id);

	setJwt(user, reply, !!user.tfaOn && tfa);

	reply.setCookie('tfa', !!user.tfaOn && tfa ? '1' : '0', {
		path: '/',
		sameSite: 'strict',
		secure: true,
	});

	if (!user.tfaOn) {
		reply.redirect('/profile');
	} else {
		reply.redirect('/tfa');
	}
}

export function setJwt(user: User, reply: FastifyReply, tfaOn: boolean) {
	const token = fastify.jwt.sign({
		username: user.username,
		id: user.id,
		tfaOn,
	});

	reply.setCookie('jwt', token, {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: true,
	});

	if (!tfaOn) {
		reply.setCookie('username', user.username, {
			path: '/',
			sameSite: 'strict',
			secure: true,
		});
	}
}

export async function logoutUser(request: FastifyRequest, reply: FastifyReply) {
	const username = (request.user as any)?.username;
	if (username) {
		if (username in onlineUserStatus) {
			delete onlineUserStatus[username];
		}
	}

	const expires = new Date(Date.now() - htoms(1));

	reply.setCookie('jwt', '', {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		expires,
		secure: true,
	});
	reply.setCookie('username', '', { path: '/', expires, secure: true });
	reply.setCookie('tfa', '', { path: '/', expires, secure: true });
	sendSuccess(reply);
}
