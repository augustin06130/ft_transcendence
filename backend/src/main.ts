import Fastify, { fastify, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Database, OPEN_READWRITE, OPEN_CREATE } from 'sqlite3';
import fastifySession from '@fastify/session';
import fastifyCookie from '@fastify/cookie';
import fastifyWebsocket from '@fastify/websocket';
import path from 'path';
import dotenv from 'dotenv';
import { CertifUser } from './login';
import { logoutUser } from './logout';
import { NewUser } from './register';
import { CreateTableUser, CreateTableMessages } from './db';
import playPong from './pong';
import { connected } from 'process';
import { readFile } from 'node:fs';

dotenv.config();

const db = connectToDatabase(); // Attendez que la connexion soit établie

if (!process.env.SESSION_SECRET) {
    console.log('SESSION_SECRET chargé avec succès :', process.env.SESSION_SECRET);
    console.error("Erreur : SESSION_SECRET n'est pas défini dans les variables d'environnement.");
    process.exit(1);
}

const app: FastifyInstance = Fastify({ logger: true });

/******************************************/
// Web socket
/******************************************/

app.register(fastifyWebsocket, {
    options: {
        maxPayload: 1048576,
        clientTracking: true,
    },
});

app.register(async function (app) {
    app.get('/pong-ws', { websocket: true }, (socket, request) => {
        playPong(socket, request);
    });
});

app.register(fastifyCookie);

app.register(fastifySession, {
    secret: process.env.SESSION_SECRET, // TODO : mettre dans l'env et le prendre avec dotenv
    cookie: {
        secure: false, // Mettez `secure: true` en production avec HTTPS
        // httpOnly: true, // Empêche l'accès au cookie via JavaScript
        maxAge: 86400, // Durée de vie du cookie en secondes (1 jour)
        path: '/', // Chemin du cookie
    }, // Mettez `secure: true` en production avec HTTPS
});

app.get('/bundle.js', (request: FastifyRequest, reply: FastifyReply) => {
    readFile(path.join(__dirname, '../public/js/bundle.js'), (err: any, fileBuffer: any) => {
		reply.header('Content-Type', 'text/javascript')
        reply.send(err || fileBuffer);
    });
});

app.get('/*', (request: FastifyRequest, reply: FastifyReply) => {
    readFile(path.join(__dirname, '../public/index.html'), (err: any, fileBuffer: any) => {
		reply.header('Content-Type', 'text/html')
        reply.send(err || fileBuffer);
    });
});

app.post('/login', async (request, reply) => {
    const { username, password } = request.body as { username: string; password: string };
    await CertifUser(username, password, request, reply, db);
});

app.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    const { username, email, password } = request.body as { username: string; email: string; password: string };
    await NewUser(username, email, password, reply, db);
});

app.post('/logout', async (request, reply) => {
    return logoutUser(request, reply);
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
        // Connexion à la base de données
        // db = await connectToDatabase(); // Attendez que la connexion soit établie

        // Créez la table 'users' si elle n'existe pas
        await CreateTableUser(db);
        await CreateTableMessages(db);

        // Démarrez le serveur
        await app.listen({
            port: 80,
            host: '0.0.0.0',
        });
        // console.log('Server is listening on http://localhost:80');
    } catch (err) {
        console.error('Erreur lors du démarrage du serveur :', err);
        process.exit(1);
    }
};

start();
