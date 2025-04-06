import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Database, OPEN_READWRITE, OPEN_CREATE } from 'sqlite3';
import fastifyCookie from '@fastify/cookie';
import fastifyWebsocket from '@fastify/websocket';
import fastifyJWT from '@fastify/jwt';
import fastifyFormbody from '@fastify/formbody';
import { getMatches, getMatchesCount } from './matches';
import dotenv from 'dotenv';
import { loginPassword, logoutUser } from './login';
import { newUser as newUser } from './register';
import { createTableUser, getProfile, updateProfile, updateProfileImage } from './user';
import { create_room, validate_roomId, join_room, get_tree } from './room';
import { createTableMatches } from './matches';
import setupStaticLocations from './static';
import fs from 'fs'
import { handleGoogle } from './googleAuth';

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
	'/api/login',
	'/api/register',
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
	// reply.header('Referrer-Policy', 'no-referrer-when-downgrade');
	reply.header('Content-Security-Policy', "script-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/client; frame-src 'self' https://accounts.google.com/gsi/; connect-src 'self' https://accounts.google.com/gsi/;");

	done();
});

fastify.get('/api/matches', getMatches);
fastify.get('/api/matches/count', getMatchesCount);
fastify.get('/api/room', create_room);
fastify.post('/api/tournament', get_tree);
fastify.post('/api/room', validate_roomId);
fastify.post('/api/logout', logoutUser);
fastify.register(async fastify => {
	fastify.get('/api/pong', { websocket: true }, join_room);
});

fastify.post('/api/login', async (request, reply) => {
	await loginPassword(request, reply);
});

fastify.get('/api/profile', getProfile);
fastify.post('/api/profile', updateProfile);
fastify.post('/api/profile/image', updateProfileImage);
fastify.post('/api/register', async (request: FastifyRequest, reply: FastifyReply) => {
	const { username, email, password } = request.body as {
		username: string;
		email: string;
		password: string;
	};
	await newUser(username, email, password, null, reply);
});

fastify.post('/api/login/google', handleGoogle)


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
