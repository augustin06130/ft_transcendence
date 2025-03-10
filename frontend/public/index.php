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
    echo "Base de données SQLite et utilisateur créés.<br>";
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ft_transcendence - Accueil</title>
    <style>
        /* Définir le style global de la page */
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #f4f4f4;
            text-align: center;
        }

        /* Conteneur de la page */
        .container {
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
            text-align: center;
        }

        /* Style du titre */
        h1 {
            font-size: 48px;
            margin-bottom: 20px;
        }

        /* Style du bouton */
        .btn {
            background-color: #007bff;
            color: white;
            font-size: 18px;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            text-decoration: none;
            transition: background-color 0.3s;
        }

        /* Effet au survol du bouton */
        .btn:hover {
            background-color: #0056b3;
        }

        /* Style pour la page Pong (autre page) */
        .pong-page {
            text-align: center;
            margin-top: 50px;
        }

        /* Style du lien login ou nom d'utilisateur */
        .login-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            background-color: #28a745;
            color: white;
            padding: 8px 15px;
            border-radius: 5px;
            text-decoration: none;
            font-size: 16px;
        }

        .login-btn:hover {
            background-color: #218838;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>ft_transcendence</h1>
        <a href="pong.html" class="btn">Pong</a>
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




<!-- <!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ft_transcendence - Accueil</title>
    <style>
        /* Définir le style global de la page */
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #f4f4f4;
            text-align: center;
        }

        /* Conteneur de la page */
        .container {
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
            text-align: center;
        }

        /* Style du titre */
        h1 {
            font-size: 48px;
            margin-bottom: 20px;
        }

        /* Style du bouton */
        .btn {
            background-color: #007bff;
            color: white;
            font-size: 18px;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            text-decoration: none;
            transition: background-color 0.3s;
        }

        /* Effet au survol du bouton */
        .btn:hover {
            background-color: #0056b3;
        }

        /* Style pour la page Pong (autre page) */
        .pong-page {
            text-align: center;
            margin-top: 50px;
        }

        /* Style du lien login ou nom d'utilisateur */
        .login-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            background-color: #28a745;
            color: white;
            padding: 8px 15px;
            border-radius: 5px;
            text-decoration: none;
            font-size: 16px;
        }

        .login-btn:hover {
            background-color: #218838;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>ft_transcendence</h1>
        <a href="pong.html" class="btn">Pong</a>
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
 -->
