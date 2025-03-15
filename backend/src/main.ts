import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifySession from '@fastify/session';
import fastifyCookie from '@fastify/cookie';
import path from 'path';
import dotenv from 'dotenv';
import { CertifUser } from './login';
import { NewUser } from './register';

dotenv.config();

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
  await CertifUser(username, password, request, reply);
});

app.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
  const { username, password } = request.body as { username: string; password: string };
  await NewUser(username, password, reply);
});

// Start the server
const start = async () => {
  try {
    await app.listen({
      port: 80,
      host: '0.0.0.0',
    });
    console.log('Server is listening on http://localhost:80');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();






    // "hot-reload": "npm install && nodemon --watch ./src --exec 'npm run build && npm run start'"
//











/*
import  {fastify, FastifyReply} from 'fastify';


const app = fastify({ logger: true });

app.get('/', (request, reply: FastifyReply) => {
    // reply.sendFile('index.html'); // Serve index.html directly
  });


*/




/*

import FastifyInstance from 'fastify';
import FastifyReply from 'fastify';
import FastifyRequest from 'fastify';
import fastifyStatic from 'fastify-static';
import path from 'path';

const app: FastifyInstance = Fastify({ logger: true });

const __dirname = "lol"
// Serve static files from the 'public' directory
app.register(fastifyStatic, {
  root: path.join(__dirname, '../public'), // Adjust the path to your public directory
  prefix: '/', // Optional: set a prefix for the routes
});

// Define a route to serve index.html directly
app.get('/', (request: FastifyRequest, reply: FastifyReply) => {
  reply.sendFile('index.html'); // Serve index.html directly
});

// Start the server
const start = async () => {
  try {
    await app.listen({
      port: 3000,
      host: '0.0.0.0',
    });
    console.log('Server is listening on http://localhost:3000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

*/







/*

// Démarrer la session pour pouvoir utiliser les variables de session
session_start();

// Vérifier si l'utilisateur est connecté
$isLoggedIn = isset($_SESSION['username']);

// Créer une nouvelle base de données SQLite (si elle n'existe pas déjà)
$db = new SQLite3('/var/www/database.db');

// Créer une table 'users' si elle n'existe pas
$db->exec("CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
)");

// Ajouter un utilisateur (avec un mot de passe sécurisé) si la table est vide
// Cela peut être fait une seule fois pour initialiser la base de données
$result = $db->query("SELECT COUNT(*) FROM users");
$row = $result->fetchArray(SQLITE3_ASSOC);
if ($row['COUNT(*)'] == 0) {
    $username = 'testuser';
    $password = password_hash('testpassword', PASSWORD_DEFAULT);  // Hachage du mot de passe

    $stmt = $db->prepare("INSERT INTO users (username, password) VALUES (:username, :password)");
    $stmt->bindValue(':username', $username, SQLITE3_TEXT);
    $stmt->bindValue(':password', $password, SQLITE3_TEXT);
    $stmt->execute();
}

*/