import { FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import {CheckUserExists, CreateNewUser} from './db';

declare module '@fastify/session' {
    interface FastifySessionObject {
        username?: string;
    }
}

export async function NewUser(
    username: string, 
    password: string,
    reply: FastifyReply
) {
      if (!username || !password) {
        return reply.status(400).send({ error: 'Nom d\'utilisateur et mot de passe requis' });
      }
      try {
        const userExists = await CheckUserExists(username);
        if (userExists) {
          return reply.status(400).send({ error: 'Cet utilisateur existe déjà.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await CreateNewUser(username, hashedPassword);
  
        return reply.redirect('./index.html');
      } catch (err) {
        console.error('Erreur lors de l\'inscription :', err);
        return reply.status(500).send({ error: 'Erreur interne du serveur' });
      }
    
}
/*

// Inclure le fichier de connexion à la base de données
include('db.php');

// Vérifier si le formulaire est soumis
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Récupérer les données du formulaire
    $username = $_POST['username'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT); // Hash du mot de passe pour plus de sécurité

    // Vérifier si l'utilisateur existe déjà
    $stmt = $db->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);

    if ($stmt->rowCount() > 0) {
        // Si l'utilisateur existe déjà
        echo "Cet utilisateur existe déjà.";
    } else {
        // Ajouter l'utilisateur dans la base de données
        $stmt = $db->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        if ($stmt->execute([$username, $password])) {
            header('Location: /public/login.html');
            exit;
        } else {
            echo "Erreur lors de l'inscription.";
        }
    }
} else {
    echo "Méthode de requête invalide.";
    echo $_SERVER['REQUEST_METHOD'];
}

*/