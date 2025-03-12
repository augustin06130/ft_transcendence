<?php
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
?>
