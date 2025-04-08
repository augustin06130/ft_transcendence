import * as dotenv from 'dotenv';
dotenv.config();

import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Database, OPEN_READWRITE, OPEN_CREATE } from 'sqlite3';
import fastifySession from '@fastify/session';
import fastifyCookie from '@fastify/cookie';
import fastifyWebsocket from '@fastify/websocket';
import { readFile } from 'node:fs';

import path from 'path';
import { CertifUser } from './login';
import { logoutUser } from './logout';
import { NewUser } from './register';
import { CreateTableUser, CreateTableMessages, VerifUser } from './db';
import { create_room, validate_roomId, join_room, pongRooms } from './room';
import { setupChatWebSocket } from './websocket';
import { createAuthToken, verifyToken, authenticate } from './auth';


const port: number = 80;
const host: string = '0.0.0.0';

const db = connectToDatabase();

if (!process.env.SESSION_SECRET) {
	console.error("Erreur : SESSION_SECRET n'est pas défini dans les variables d'environnement.");
	process.exit(1);
}

if (!process.env.JWT_SECRET) {
	console.error("Erreur : JWT_SECRET n'est pas défini dans les variables d'environnement.");
	process.exit(1);
}

const app: FastifyInstance = Fastify({
	logger: true,
	trustProxy: true
});

app.register(fastifyWebsocket, {
	options: {
		maxPayload: 1048576, // 1MB
		clientTracking: true,
	},
});


app.register(fastifyCookie);

app.register(fastifySession, {
	secret: process.env.SESSION_SECRET,
	cookie: {
		secure: process.env.NODE_ENV === 'production', // Activé en production
		httpOnly: true,
		maxAge: 86400000, // 24 heures en millisecondes
		path: '/',
	},
});

// Routes pour le jeu Pong
app.get('/create-room', create_room);
app.post('/tournament', (request: FastifyRequest, reply: FastifyReply) => {
	const { roomId } = request.body as { roomId: string };
	reply.header('Content-Type', 'text/plain');
	if (pongRooms.get(roomId)?.tournament.mode === 'remote') {
		reply.send(pongRooms.get(roomId)?.tournamentTree());
	}
	else {
		reply.code(412).send()
	}
});
app.post('/validate-roomid', validate_roomId);

// Routes pour les WebSockets
app.register(async function(app) {
	// WebSocket pour le jeu
	app.get('/pong-ws', { websocket: true }, join_room);

	// WebSocket pour le chat
	app.get('/chat-ws', { websocket: true }, (connection, req) => {
		setupChatWebSocket(connection, req, db);
	});
});


interface WebSocketVerifyClientInfo {
	req: FastifyRequest;
	secure: boolean;
  }

  // Configuration unique des WebSockets
  app.register(require('@fastify/websocket'), {
	options: {
		verifyClient: (info: WebSocketVerifyClientInfo, next: (result: boolean) => void) => {
			try {
				const token = info.req.headers['sec-websocket-protocol'] as string;
				verifyToken(token);
				next(true);
			} catch (error) {
				console.error('Connexion WebSocket non autorisée:', error);
				next(false);
			}
		}
	}
});


// Routes statiques
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

// Routes d'authentification
app.post('/login', async (request, reply) => {
	const { username, password } = request.body as { username: string; password: string };
	await CertifUser(username, password, request, reply, db);

  // Ici, ajoutez votre logique de vérification des identifiants
  const user = await VerifUser(username, db);

  if (!user) {
    throw new Error('Invalid id');
  }

  const token = createAuthToken(user.id, user.username);

  return {
    token,
    user: {
      id: user.id,
      username: user.username
    }
  };
});

app.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
	const { username, email, password } = request.body as {
		username: string;
		email: string;
		password: string;
	};
	await NewUser(username, email, password, reply, db);
});

app.post('/logout', async (request, reply) => {
	return logoutUser(request, reply);
});

// Route pour obtenir l'utilisateur actuel
app.get('/api/current-user', (request: FastifyRequest, reply: FastifyReply) => {
	if (request.session.username) {
		reply.send({
			username: request.session.username,
			authenticated: true
		});
	} else {
		reply.send({
			authenticated: false
		});
	}
});

// Route catch-all pour le SPA frontend
app.get('/*', (_: FastifyRequest, reply: FastifyReply) => {
	readFile(path.join(__dirname, '../public/index.html'), (err: any, fileBuffer: any) => {
		reply.header('Content-Type', 'text/html');
		reply.send(err || fileBuffer);
	});
});

export function connectToDatabase() {
	const dbPath = './database.db';
	const db = new Database(dbPath, OPEN_READWRITE | OPEN_CREATE, err => {
		if (err) {
			console.error('Échec de la connexion à la base de données : ' + err.message);
		} else {
			console.log('Connexion à la base de données réussie.');
		}
	});
	return db;
}

const start = async () => {
	try {
		// Créez les tables si elles n'existent pas
		await CreateTableUser(db);
		await CreateTableMessages(db);

		// Démarrez le serveur
		await app.listen({ port, host });
		console.log(`Serveur démarré sur http://${host}:${port}`);
	} catch (err) {
		console.error('Erreur lors du démarrage du serveur :', err);
		process.exit(1);
	}
};

start();
