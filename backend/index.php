<?php
// Démarrer la session pour pouvoir utiliser les variables de session
session_start();

// Vérifier si l'utilisateur est connecté
$isLoggedIn = isset($_SESSION['username']);
?>

<?php
// Créer une nouvelle base de données SQLite
$db = new SQLite3('/var/www/html/database.db');

// Créer une table 'users'
$db->exec("CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
)");

// Ajouter un utilisateur (avec un mot de passe sécurisé)
$username = 'testuser';
$password = password_hash('testpassword', PASSWORD_DEFAULT);  // Hachage du mot de passe

$stmt = $db->prepare("INSERT INTO users (username, password) VALUES (:username, :password)");
$stmt->bindValue(':username', $username, SQLITE3_TEXT);
$stmt->bindValue(':password', $password, SQLITE3_TEXT);
$stmt->execute();

echo "Base de données SQLite et utilisateur créés.";
?>

