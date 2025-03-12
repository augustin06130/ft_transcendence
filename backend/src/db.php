<?php
// db.php - Connexion à la base de données SQLite
try {
    // Créer une connexion à la base de données SQLite
    $db = new PDO('sqlite:/var/www/database.db'); // Change le chemin si nécessaire
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // Si une erreur se produit, l'afficher
    die("Échec de la connexion à la base de données : " . $e->getMessage());
}
?>
