// import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
// import { Database, OPEN_READWRITE, OPEN_CREATE } from 'sqlite3';
// import fastifySession from '@fastify/session';
// import fastifyCookie from '@fastify/cookie';
// import fastifyWebsocket from '@fastify/websocket';
// import { readFile } from 'node:fs';

// import path from 'path';
// import dotenv from 'dotenv';
// import { CertifUser } from './login';
// import { logoutUser } from './logout';
// import { NewUser } from './register';
// import { CreateTableUser } from './db';
// import { create_room, validate_roomId, join_room, pongRooms } from './room';


// dotenv.config();

// const port: number = 80;
// const host: string = '0.0.0.0';

// const db = connectToDatabase(); // Attendez que la connexion soit établie

// if (!process.env.SESSION_SECRET) {
// 	console.log('SESSION_SECRET chargé avec succès :', process.env.SESSION_SECRET);
// 	console.error("Erreur : SESSION_SECRET n'est pas défini dans les variables d'environnement.");
// 	process.exit(1);
// }

// const app: FastifyInstance = Fastify({ logger: true });

// app.register(fastifyWebsocket, {
// 	options: {
// 		maxPayload: 1048576,
// 		clientTracking: true,
// 	},
// });

// app.register(fastifyCookie);

// app.register(fastifySession, {
// 	secret: process.env.SESSION_SECRET, // TODO : mettre dans l'env et le prendre avec dotenv
// 	cookie: {
// 		secure: false, // Mettez `secure: true` en production avec HTTPS
// 		// httpOnly: true, // Empêche l'accès au cookie via JavaScript
// 		maxAge: 86400, // Durée de vie du cookie en secondes (1 jour)
// 		path: '/', // Chemin du cookie
// 	},
// });

// app.get('/create-room', create_room);

// app.post('/tournament', (request: FastifyRequest, reply: FastifyReply) => {
// 	const { roomId } = request.body as { roomId: string };
// 	reply.header('Content-Type', 'text/plain');
// 	if (pongRooms.get(roomId)?.tournament.mode === 'remote') {
// 		reply.send(pongRooms.get(roomId)?.tournamentTree());
// 	}
// 	else {
// 		reply.code(412).send()
// 	}
// });

// app.post('/validate-roomid', validate_roomId);

// app.register(async function(app) {
// 	app.get('/pong-ws', { websocket: true }, join_room);
// });

// app.get('/output.css', (_: FastifyRequest, reply: FastifyReply) => {
// 	readFile(path.join(__dirname, '../public/output.css'), (err: any, fileBuffer: any) => {
// 		reply.header('Content-Type', 'text/css');
// 		reply.send(err || fileBuffer);
// 	});
// });

// app.get('/bundle.js', (_: FastifyRequest, reply: FastifyReply) => {
// 	readFile(path.join(__dirname, '../public/bundle.js'), (err: any, fileBuffer: any) => {
// 		reply.header('Content-Type', 'text/javascript');
// 		reply.send(err || fileBuffer);
// 	});
// });

// app.get('/*', (_: FastifyRequest, reply: FastifyReply) => {
// 	readFile(path.join(__dirname, '../public/index.html'), (err: any, fileBuffer: any) => {
// 		reply.header('Content-Type', 'text/html');
// 		reply.send(err || fileBuffer);
// 	});
// });

// app.post('/login', async (request, reply) => {
// 	const { username, password } = request.body as { username: string; password: string };
// 	await CertifUser(username, password, request, reply, db);
// });

// app.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
// 	const { username, email, password } = request.body as {
// 		username: string;
// 		email: string;
// 		password: string;
// 	};
// 	await NewUser(username, email, password, reply, db);
// });

// app.post('/logout', async (request, reply) => {
// 	return logoutUser(request, reply);
// });

// export function connectToDatabase() {
// 	const dbPath = './database.db';
// 	const db = new Database(dbPath, OPEN_READWRITE | OPEN_CREATE, err => {
// 		if (err) {
// 			console.error('Échec de la connexion à la base de données : ' + err.message);
// 		} else {
// 			console.log('Connexion à la base de données réussie.');
// 		}
// 	});
// 	return db;
// }

// const start = async () => {
// 	try {
// 		// Connexion à la base de données
// 		// db = await connectToDatabase(); // Attendez que la connexion soit établie

// 		// Créez la table 'users' si elle n'existe pas
// 		await CreateTableUser(db);

// 		// Démarrez le serveur
// 		await app.listen({ port, host });
// 		// console.log('Server is listening on http://localhost:80');
// 	} catch (err) {
// 		console.error('Erreur lors du démarrage du serveur :', err);
// 		process.exit(1);
// 	}
// };

// start();



import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Database, OPEN_READWRITE, OPEN_CREATE } from 'sqlite3';
import fastifySession from '@fastify/session';
import fastifyCookie from '@fastify/cookie';
import fastifyWebsocket from '@fastify/websocket';
import { readFile } from 'node:fs';

import path from 'path';
import dotenv from 'dotenv';
import { CertifUser } from './login';
import { logoutUser } from './logout';
import { NewUser } from './register';
import { CreateTableUser, CreateTableMessages } from './db';
import { create_room, validate_roomId, join_room, pongRooms } from './room';
import { setupChatWebSocket } from './websocket';

dotenv.config();

const port: number = 80;
const host: string = '0.0.0.0';

const db = connectToDatabase();

if (!process.env.SESSION_SECRET) {
	console.error("Erreur : SESSION_SECRET n'est pas défini dans les variables d'environnement.");
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
