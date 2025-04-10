import { createTableUser, getProfile, getUsernameList, isUser, updateProfile, updateProfileImage } from './user';
import { addFriend, createTableFriends, getFriends, removeFriend } from './friends';
import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { create_room, validate_roomId, get_tree, join_room } from './room';
import { onlineUserStatus, startOnlineUserTracking } from './onlineUsers';
import { confirmTfa, enableTfa, loginTfa, removeTfa } from './tfa';
import { getMatches, getMatchesCount, getStats } from './matches';
import { Database, OPEN_READWRITE, OPEN_CREATE } from 'sqlite3';
import { handleGoogle, logoutUser } from './googleAuth';
import fastifyWebsocket from '@fastify/websocket';
import fastifyFormbody from '@fastify/formbody';
import { createTableMatches } from './matches';
import setupStaticLocations from './static';
import fastifyCookie from '@fastify/cookie';
import { runPromise } from './promise';
import fastifyJWT from '@fastify/jwt';
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
	'/api/logout',
]);

fastify.addHook('onRequest', async (request, reply) => {
	const route = request.routeOptions.url as string;

	try {
		const jwt: any = await request.jwtVerify({ onlyCookie: true });
		console.log(jwt)
		if (jwt.username) {
			onlineUserStatus[jwt.username] = { time: Date.now(), status: 'online' };
		}
		if (request.routeOptions.url as string !== '/api/tfa/login' && jwt.tfaOn) {
			if (authorizedRoutes.has(route)) return;
			reply.redirect('/tfa');
		}
	} catch (err) {
		if (authorizedRoutes.has(route)) return;
		reply.redirect('/');
	}
});

fastify.addHook('onRequest', (_, reply, done) => {
	reply.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
	reply.header(
		'Content-Security-Policy',
		"script-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/client; frame-src 'self' https://accounts.google.com/gsi/; connect-src 'self' https://accounts.google.com/gsi/;"
	);
	done();
});

function addPost(route: string, handler: (request: FastifyRequest, reply: FastifyReply) => any) {
	fastify.post(route, async (request, reply) => {
		try {
			await handler(request, reply);
		} catch (err: any) {
			if (typeof err === 'object' && typeof err.code) {
				reply.code(err.code).send(err.message);
				console.error(err);
			} else {
				reply.code(400).send(err);
			}
		}
	});
}

function addGet(route: string, handler: (request: FastifyRequest, reply: FastifyReply) => any) {
	fastify.get(route, async (request, reply) => {
		try {
			await handler(request, reply);
		} catch (err: any) {
			if (typeof err === 'object' && typeof err.code) {
				reply.code(err.code).send(err.message);
				console.error(err);
			} else {
				reply.code(400).send(err);
			}
		}
	});
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
addPost('/api/profile/image', updateProfileImage);
addGet('/api/profile/list', getUsernameList);

addPost('/api/login/google', handleGoogle);
addPost('/api/logout', logoutUser);

addGet('/api/tfa/add', enableTfa);
addPost('/api/tfa/verify', confirmTfa);
addPost('/api/tfa/login', loginTfa);
addGet('/api/tfa/remove', removeTfa);

fastify.register(async fastify => {
	fastify.get('/api/pong', { websocket: true }, join_room);
});

setupStaticLocations(fastify, [
	'/style.css',
	'/output.css',
	'/bundle.js',
	'/favicon.ico',
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

async function createDatabase() {
	await createTableUser();
	await createTableMatches();
	await createTableFriends();
	await runPromise('PRAGMA foreign_keys = ON;')
}

const start = async () => {
	try {
		await createDatabase();
		startOnlineUserTracking();
		await fastify.listen({ port, host });
		console.log('Server is listening on https://localhost:8080');
	} catch (err) {
		console.error('Error starting server:', err);
		process.exit(1);
	}
};

start();
