import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Database, OPEN_READWRITE, OPEN_CREATE } from 'sqlite3';
import fastifyCookie from '@fastify/cookie';
import fastifyWebsocket from '@fastify/websocket';
import fastifyJWT from '@fastify/jwt';
import { readFile } from 'node:fs';
import { get_stats } from './matches';

import path from 'path';
import dotenv from 'dotenv';
import { CertifUser } from './login';
import { logoutUser } from './logout';
import { NewUser } from './register';
import { CreateTableUser } from './user';
import { create_room, validate_roomId, join_room, get_tree } from './room';
import { createTableMatches } from './matches';


dotenv.config();

const port: number = 80;
const host: string = '0.0.0.0';

export const db = connectToDatabase();

if (!process.env.SESSION_SECRET) {
	console.log('SESSION_SECRET chargé avec succès :', process.env.SESSION_SECRET);
	console.error("Erreur : SESSION_SECRET n'est pas défini dans les variables d'environnement.");
	process.exit(1);
}

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

// app.register(fastifySession, {
// 	secret: process.env.SESSION_SECRET,
// 	cookie: {
// 		secure: false, // Mettez `secure: true` en production avec HTTPS
// 		httpOnly: true, // Empêche l'accès au cookie via JavaScript
// 		maxAge: 86400, // Durée de vie du cookie en secondes (1 jour)
// 		path: '/', // Chemin du cookie
// 	},
// });

app.addHook("onRequest", async (request, reply) => {
	const routes = new Set(['', '/', '/output.css', '/style.css', '/bundle.js', '/login-user']);
	try {
		if (!routes.has(request.url)) {
			await request.jwtVerify({ onlyCookie: true });
		}
	} catch (err) {
		console.log(err)
		reply.redirect('/')
	}
})

app.get('/getstats', get_stats);
app.get('/create-room', create_room);
app.post('/tournament', get_tree);
app.post('/validate-roomid', validate_roomId);
app.post('/logout', logoutUser);
app.register(async (app) => {
	app.get('/pong-ws', { websocket: true }, join_room);
});

app.post('/login-user', async (request, reply) => {
	await CertifUser(request, reply, db, app);
});

app.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
	const { username, email, password } = request.body as {
		username: string;
		email: string;
		password: string;
	};
	await NewUser(username, email, password, reply, db);
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
		await CreateTableUser(db);
		await createTableMatches(db);

		await app.listen({ port, host });
		console.log('Server is listening on http://localhost:8080');
	} catch (err) {
		console.error('Error starting server :', err);
		process.exit(1);
	}
};

start();
