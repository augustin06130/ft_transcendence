import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Database, OPEN_READWRITE, OPEN_CREATE } from 'sqlite3';
import fastifyCookie from '@fastify/cookie';
import fastifyWebsocket from '@fastify/websocket';
import fastifyJWT from '@fastify/jwt';
import { readFile } from 'node:fs';
import { getMatches } from './matches';

import path from 'path';
import dotenv from 'dotenv';
import { certifUser, logoutUser } from './login';
import { NewUser } from './register';
import { createTableUser, getProfile, updateProfile } from './user';
import { create_room, validate_roomId, join_room, get_tree } from './room';
import { createTableMatches } from './matches';


dotenv.config();

const port: number = 80;
const host: string = '0.0.0.0';


if (!process.env.SESSION_SECRET) {
	console.error('env missing');
	process.exit(1);
}

export const db = connectToDatabase();
const app: FastifyInstance = Fastify({ logger: true });

app.register(fastifyWebsocket);
app.register(fastifyCookie);
app.register(fastifyJWT, {
	secret: process.env.SESSION_SECRET,
	cookie: {
		cookieName: 'jwt',
		signed: false
	}
})

const routes = new Set(['', '/', '/favicon.ico', '/output.css', '/style.css', '/bundle.js', '/api/login', '/api/register']);
app.addHook("onRequest", async (request, reply) => {
	try {
		if (!routes.has(request.url)) {
			await request.jwtVerify({ onlyCookie: true });
		}
	} catch (err) {
		console.log(err)
		reply.redirect('/')
	}
})

app.get('/api/stats', getMatches);
app.get('/api/room', create_room);
app.post('/api/tournament', get_tree);
app.post('/api/room', validate_roomId);
app.post('/api/logout', logoutUser);
app.register(async (app) => {
	app.get('/api/pong', { websocket: true }, join_room);
});

app.post('/api/login', async (request, reply) => {
	await certifUser(request, reply, app);
});

app.get('/api/profile', getProfile);
app.post('/api/profile', updateProfile);

app.post('/api/register', async (request: FastifyRequest, reply: FastifyReply) => {
	const { username, email, password } = request.body as {
		username: string;
		email: string;
		password: string;
	};
	await NewUser(username, email, password, reply);
});

app.get('/style.css', (_: FastifyRequest, reply: FastifyReply) => {
	readFile(path.join(__dirname, '../public/style.css'), (err: any, fileBuffer: any) => {
		reply.header('Content-Type', 'text/css');
		reply.send(err || fileBuffer);
	});
});

app.get('/output.css', (_: FastifyRequest, reply: FastifyReply) => {
	readFile(path.join(__dirname, '../public/output.css'), (err: any, fileBuffer: any) => {
		reply.header('Content-Type', 'text/css');
		reply.send(err || fileBuffer);
	});
});

app.get('/bundle.js', (_: FastifyRequest, reply: FastifyReply) => {
	readFile(path.join(__dirname, '../public/bundle.js'), (err: any, fileBuffer: any) => {
		reply.header('Content-Type', 'text/javascript');
		reply.send(err || fileBuffer);
	});
});

app.get('/favicon.ico', (_: FastifyRequest, reply: FastifyReply) => {
	readFile(path.join(__dirname, '../public/favicon.ico'), (err: any, fileBuffer: any) => {
		reply.header('Content-Type', 'text/javascript');
		reply.send(err || fileBuffer);
	});
});

app.get('/*', (_: FastifyRequest, reply: FastifyReply) => {
	readFile(path.join(__dirname, '../public/index.html'), (err: any, fileBuffer: any) => {
		reply.header('Content-Type', 'text/html');
		reply.send(err || fileBuffer);
	});
});

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

		await app.listen({ port, host });
		console.log('Server is listening on http://localhost:8080');
	} catch (err) {
		console.error('Error starting server:', err);
		process.exit(1);
	}
};

start();
