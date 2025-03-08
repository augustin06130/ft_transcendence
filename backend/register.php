<?php
// register.php - Traitement du formulaire d'inscription

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
            echo "Inscription réussie ! Vous pouvez maintenant vous connecter.";
        } else {
            echo "Erreur lors de l'inscription.";
        }
    }
} else {
    echo "Méthode de requête invalide.";
}
?>
