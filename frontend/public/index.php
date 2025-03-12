<?php
// Démarrer la session pour pouvoir utiliser les variables de session
session_start();

// Vérifier si l'utilisateur est connecté
$isLoggedIn = isset($_SESSION['username']);

// Créer une nouvelle base de données SQLite (si elle n'existe pas déjà)
$db = new SQLite3('/var/www/html/database.db');

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
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ft_transcendence - Accueil</title>
    <link rel="stylesheet" href="index.css">
</head>
<body>
    <div class="container">
        <h1>ft_transcendence</h1>
        <a href="pong/pong.html" class="btn">Pong</a>
    </div>

    <!-- Afficher le bouton de login ou le nom d'utilisateur -->
    <div class="login-btn-container">
        <?php if ($isLoggedIn): ?>
            <span>Bienvenue, <?php echo $_SESSION['username']; ?></span>
        <?php else: ?>
            <a href="login.html" class="login-btn">Login</a>
        <?php endif; ?>
    </div>
</body>
</html>
