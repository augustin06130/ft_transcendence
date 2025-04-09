import { Database, OPEN_READWRITE, OPEN_CREATE } from 'sqlite3';
import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyFormbody from '@fastify/formbody';
import fastifyCookie from '@fastify/cookie';
import fastifyJWT from '@fastify/jwt';
import {
	createTableUser,
	getProfile,
	getUsernameList,
	isUser,
	updateProfile,
	updateProfileImage,
} from './user';
import { addFriend, createTableFriends, getFriends, removeFriend } from './friends';
import { create_room, validate_roomId, get_tree, join_room } from './room';
import { getMatches, getMatchesCount, getStats } from './matches';
import { handleGoogle, logoutUser } from './googleAuth';
import { createTableMatches } from './matches';
import setupStaticLocations from './static';
import { Status } from './types';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const port: number = 80;
const host: string = '0.0.0.0';

if (!process.env.SESSION_SECRET) {
	console.error('Missing session sercret');
	process.exit(1);
}

if (!process.env.GOOGLE_WEB_CLIENT_ID) {
	console.error('Missing google id');
	process.exit(1);
}

export const db = connectToDatabase();

export const fastify: FastifyInstance = Fastify({
	logger: true,
	https: {
		key: fs.readFileSync('/etc/fastify/ssl/key.pem'),
		cert: fs.readFileSync('/etc/fastify/ssl/cert.pem'),
	},
});

fastify.register(fastifyWebsocket);

fastify.register(fastifyFormbody);
fastify.register(fastifyCookie);

fastify.register(fastifyJWT, {
	secret: process.env.SESSION_SECRET,
	cookie: {
		cookieName: 'jwt',
		signed: false,
	},
});

const authorizedRoutes = new Set([
	'',
	'/*',
	'/favicon.ico',
	'/output.css',
	'/style.css',
	'/bundle.js',
	'/api/login/google',
	'/cli/close',
]);

fastify.addHook('onRequest', async (request, reply) => {
	try {
		if (!authorizedRoutes.has(request.routeOptions.url as string)) {
			await request.jwtVerify({ onlyCookie: true });
			const username = (request.user as any).username;
			if (username) {
				onlineUserStatus[username] = { time: Date.now(), status: 'online' };
			}

		}
	} catch (err) {
		console.log(err);
		reply.redirect('/');
	}
});

export const onlineUserStatus: Status = {
	'Computer': { time: Number.MAX_SAFE_INTEGER, status: 'online' },
	'Guest': { time: Number.MAX_SAFE_INTEGER, status: 'online' }
};

setInterval(() => {
	const now = Date.now();
	Object.entries(onlineUserStatus).forEach(([key, value]) => {
		if (value.time + 60000 > now && value.status === 'online')
			delete onlineUserStatus[key];
	})
}, 60000)

fastify.addHook('onRequest', (_, reply, done) => {
	reply.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
	reply.header(
		'Content-Security-Policy',
		"script-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/client; frame-src 'self' https://accounts.google.com/gsi/; connect-src 'self' https://accounts.google.com/gsi/;"
	);

	done();
});

function addPost(route: string, handler: (request: FastifyRequest, reply: FastifyReply) => any) {
	fastify.post(route, (request, reply) => {
		try {
			handler(request, reply);
		} catch (err: any) {
			if (typeof err === 'object' && err.has('code')) {
				reply.code(err.code).send(err.message);
				console.error(err)
			} else {
				reply.code(400).send(err);
			}
		}
	});
}

function addGet(route: string, handler: (request: FastifyRequest, reply: FastifyReply) => any) {
	fastify.get(route, (request, reply) => {
		try {
			handler(request, reply);
		} catch (err: any) {
			if (typeof err === 'object' && err.has('code')) {
				reply.code(err.code).send(err.message);
				console.error(err)
			} else {
				reply.code(400).send(err);
			}
		}
	});
}

fastify.get('/pong', (_, rep) => rep.redirect('/room'));
addGet('/cli/close', (_, rep) => rep.send('You can close the window'));
addGet('/api/matches', getMatches);
addGet('/api/stats', getStats);
addGet('/api/matches/count', getMatchesCount);
addGet('/api/room', create_room);
addGet('/api/profile', getProfile);
addGet('/api/user', isUser);
addGet('/api/profile/list', getUsernameList);

addGet('/api/friend/all', getFriends);
addPost('/api/friend/add', addFriend);
addPost('/api/friend/remove', removeFriend);

addPost('/api/tournament', get_tree);
addPost('/api/room', validate_roomId);
addPost('/api/profile', updateProfile);
addPost('/api/profile/image', updateProfileImage);
addPost('/api/login/google', handleGoogle);
addPost('/api/logout', logoutUser);

fastify.register(async fastify => {
	fastify.get('/api/pong', { websocket: true }, join_room);
});

setupStaticLocations(fastify, [
	'/style.css',
	'/output.css',
	'/bundle.js',
	'/favicon.ico',
	'/default-avatar.png',
]);

function connectToDatabase() {
	const dbPath = './database.db';
	const db = new Database(dbPath, OPEN_READWRITE | OPEN_CREATE, err => {
		if (err) {
			console.error('Error connection to database: ' + err.message);
		} else {
			console.log('Database connection succesfull');
		}
	});
	return db;
}

function createDatabase() {
	createTableUser();
	createTableMatches();
	createTableFriends();
	db.run('PRAGMA foreign_keys = ON;');
}

const start = async () => {
	try {
		createDatabase();

		await fastify.listen({ port, host });
		console.log('Server is listening on https://localhost:8080');
	} catch (err) {
		console.error('Error starting server:', err);
		process.exit(1);
	}
};

start();
