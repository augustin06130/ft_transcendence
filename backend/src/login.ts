import { FastifyRequest, FastifyReply } from 'fastify';
import { Database } from 'sqlite3';
import bcrypt from 'bcrypt';
import {VerifUser} from './db';

declare module '@fastify/session' {
    interface FastifySessionObject {
        username?: string;
    }
}

export async function CertifUser(
    username: string,
    userpassword: string,
    request: FastifyRequest,
    reply: FastifyReply,
    db: Database
) {
    if (!username || !userpassword) {
        return reply.status(400).send({ error: 'Nom d\'utilisateur et mot de passe requis' });
      }
    try {
        const user = await VerifUser(username, db);
        if (user && bcrypt.compareSync(userpassword, user.password)) {
            request.session.username = username;
            return reply.redirect('/index.html');
        } else {
            return reply.redirect('/index.html');
        }
    } catch(err){
        console.error('Erreur lors de la vérification des identifiants :', err);
        return reply.status(500).send({ error: 'Erreur interne du serveur' });
    }
}





// // Fonction pour initialiser la route de connexion
// export default async function loginRoutes(app: FastifyInstance) {
//   // Route POST pour gérer la connexion
//   app.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
//     // Récupérer les données du formulaire
//     const { username, password } = request.body as { username: string; password: string };

//     // Vérifier si les données sont valides
//     if (!username || !password) {
//       return reply.status(400).send({ error: 'Nom d\'utilisateur et mot de passe requis' });
//     }

//     try {
//       // Vérifier si l'utilisateur existe dans la base de données
      

//       // Si l'utilisateur existe, vérifier le mot de passe
//       if (user && bcrypt.compareSync(password, user.password)) {
//         // Connexion réussie : enregistrer l'utilisateur dans la session
//         request.session.set('username', username);

//         // Rediriger vers la page d'accueil
//         return reply.redirect('/index.html');
//       } else {
//         // Connexion échouée : rediriger vers la page de connexion avec un message d'erreur
//         return reply.redirect('/public/login.html?error=Nom d\'utilisateur ou mot de passe incorrect');
//       }
//     } catch (err) {
//       console.error('Erreur lors de la vérification des identifiants :', err);
//       return reply.status(500).send({ error: 'Erreur interne du serveur' });
//     } finally {
//       // Fermer la connexion à la base de données
//       db.close();
//     }
//   });
// }



/*
// Démarrer la session pour pouvoir utiliser les variables de session
session_start();

// Vérifier si le formulaire de connexion a été soumis
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Récupérer les données du formulaire
    $username = $_POST['username'];
    $password = $_POST['password'];

    // Créer une connexion à la base de données SQLite
    $db = new SQLite3('/var/www/database.db');

    // Vérifier si l'utilisateur existe dans la base de données
    $stmt = $db->prepare("SELECT id, password FROM users WHERE username = :username");
    $stmt->bindValue(':username', $username, SQLITE3_TEXT);
    $result = $stmt->execute();
    
    // Récupérer les résultats de la requête
    $user = $result->fetchArray(SQLITE3_ASSOC);
    
    if ($user && password_verify($password, $user['password'])) {
        // Connexion réussie : enregistrer l'utilisateur dans la session
        $_SESSION['username'] = $username;
        
        // Rediriger vers la page d'accueil (index.php)
        header('Location: /index.php');
        exit;  // Assurez-vous d'appeler exit après la redirection pour stopper l'exécution du code suivant
    } else {
        // Connexion échouée : rediriger vers la page de connexion avec un message d'erreur
        header('Location: /public/login.html?error=Nom d\'utilisateur ou mot de passe incorrect');
        exit;
    }
} else {
    // Si la méthode de la requête n'est pas POST, rediriger vers la page de connexion
    header('Location: /login.php');
    exit;
}
*/
