import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Database, OPEN_READWRITE, OPEN_CREATE } from 'sqlite3';
import fastifyStatic from '@fastify/static';
import fastifySession from '@fastify/session';
import fastifyCookie from '@fastify/cookie';
import path from 'path';
import dotenv from 'dotenv';
import { CertifUser } from './login';
import { logoutUser } from './logout';
import { NewUser } from './register';
import { CreateTableUser } from './db';
import { UserProfile } from './profile';
import {GetCurrentUserData} from './getUser';

dotenv.config();

const db = connectToDatabase(); // Attendez que la connexion soit établie

if (!process.env.SESSION_SECRET) {
  console.log('SESSION_SECRET chargé avec succès :', process.env.SESSION_SECRET);
  console.error('Erreur : SESSION_SECRET n\'est pas défini dans les variables d\'environnement.');
  process.exit(1);
}

const app: FastifyInstance = Fastify({ logger: true });

app.register(fastifyCookie);

app.register(fastifySession, {
  secret: process.env.SESSION_SECRET, // TODO : mettre dans l'env et le prendre avec dotenv
  cookie: {
    secure: false, // Mettez `secure: true` en production avec HTTPS
    httpOnly: true, // Empêche l'accès au cookie via JavaScript
    maxAge: 86400, // Durée de vie du cookie en secondes (1 jour)
    path: '/', // Chemin du cookie
  }, // Mettez `secure: true` en production avec HTTPS
});

// Serve static files from the 'public' directory
app.register(fastifyStatic, {
  root: path.join(__dirname, '../public'), // Adjust the path to your public directory
  prefix: '/', // Optional: set a prefix for the routes
});

// Define a route to serve index.html directly
app.get('/tata', (request: FastifyRequest, reply: FastifyReply) => {
  reply.sendFile('index.html'); // Serve index.html directly
});

app.post('/login', async (request, reply) => {
  const { username, password } = request.body as { username: string; password: string };
  await CertifUser(username, password, request, reply, db);
});

app.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
  const { username, email, password } = request.body as { username: string; email:string; password: string };
  await NewUser(username, email, password, reply, db);
});

app.post('/logout', async (request, reply) => {
  return logoutUser(request, reply);
});

app.post('/profile', async (request, reply) => {
  const {username, userpassword, email, phone, bio, profilePicture} = request.body as { username: string, userpassword: string, email?: string, phone?: string, bio?: string, profilePicture?: string}
  return UserProfile( username, userpassword, request, reply, db, email, phone, bio, profilePicture);
});

app.post('/getUser', async (request, reply) => {
  const { userId } = request.body as { userId: string };
  return GetCurrentUserData(request, reply, userId, db);
});

export function connectToDatabase() {
  const dbPath = './database.db';
  const db = new Database(dbPath, OPEN_READWRITE | OPEN_CREATE, (err) => {
    if (err) {
      console.error("Échec de la connexion à la base de données : " + err.message);
    } else {
      console.log("Connexion à la base de données réussie.");
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

    // Démarrez le serveur
    await app.listen({
      port: 80,
      host: '0.0.0.0',
    });
    console.log('Server is listening on http://localhost:8080');
  } catch (err) {
    console.error("Erreur lors du démarrage du serveur :", err);
    process.exit(1);
  }
};

start();

