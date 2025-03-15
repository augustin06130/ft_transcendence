import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';

const app: FastifyInstance = Fastify({ logger: true });

// Serve static files from the 'public' directory
app.register(fastifyStatic, {
  root: path.join(__dirname, '../public'), // Adjust the path to your public directory
  prefix: '/', // Optional: set a prefix for the routes
});

// Define a route to serve index.html directly
app.get('/tata', (request: FastifyRequest, reply: FastifyReply) => {
  reply.sendFile('index.html'); // Serve index.html directly
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