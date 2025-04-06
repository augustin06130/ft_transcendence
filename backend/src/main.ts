import { Database, OPEN_READWRITE, OPEN_CREATE } from 'sqlite3';
import Fastify, { FastifyInstance } from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyFormbody from '@fastify/formbody';
import fastifyCookie from '@fastify/cookie';
import fastifyJWT from '@fastify/jwt';
import { createTableUser, getProfile, updateProfile, updateProfileImage } from './user';
import { create_room, validate_roomId, get_tree, join_room } from './room';
import { getMatches, getMatchesCount } from './matches';
import { createTableMatches } from './matches';
import setupStaticLocations from './static';
import { handleGoogle, logoutUser } from './googleAuth';
import dotenv from 'dotenv';
import fs from 'fs'

dotenv.config();

const port: number = 80;
const host: string = '0.0.0.0';

if (!process.env.SESSION_SECRET) {
	console.error('env missing');
	process.exit(1);
}

if (!process.env.GOOGLE_SECRET) {
	console.error('env missing');
	process.exit(1);
}

export const db = connectToDatabase();

export const fastify: FastifyInstance = Fastify({
	logger: true,
	https: {
		key: fs.readFileSync('/etc/fastify/ssl/key.pem'),
		cert: fs.readFileSync('/etc/fastify/ssl/cert.pem'),
	}
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
	'/',
	'/favicon.ico',
	'/output.css',
	'/style.css',
	'/bundle.js',
	'/api/login/google',
]);

fastify.addHook('onRequest', async (request, reply) => {
	try {
		if (!authorizedRoutes.has(request.url)) {
			await request.jwtVerify({ onlyCookie: true });
		}
	} catch (err) {
		console.log(err);
		reply.redirect('/');
	}
});

fastify.addHook('onRequest', (_, reply, done) => {
	reply.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
	reply.header('Content-Security-Policy', "script-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/client; frame-src 'self' https://accounts.google.com/gsi/; connect-src 'self' https://accounts.google.com/gsi/;");

	done();
});

fastify.get('/api/matches', getMatches);
fastify.get('/api/matches/count', getMatchesCount);
fastify.get('/api/room', create_room);
fastify.post('/api/tournament', get_tree);
fastify.post('/api/room', validate_roomId);
fastify.register(async fastify => {
	fastify.get('/api/pong', { websocket: true }, join_room);
});

fastify.get('/api/profile', getProfile);
fastify.post('/api/profile', updateProfile);
fastify.post('/api/profile/image', updateProfileImage);

fastify.post('/api/login/google', handleGoogle)
fastify.post('/api/logout', logoutUser);


setupStaticLocations(fastify, ['/style.css', '/output.css', '/bundle.js', '/favicon.ico', '/default-avatar.png']);

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

const start = async () => {
	try {
		createTableUser();
		createTableMatches();

		await fastify.listen({ port, host });
		console.log('Server is listening on http://localhost:8080');
	} catch (err) {
		console.error('Error starting server:', err);
		process.exit(1);
	}
};

start();
