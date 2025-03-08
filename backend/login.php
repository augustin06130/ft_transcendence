<?php
// Démarrer la session pour pouvoir utiliser les variables de session
session_start();

// Inclure le fichier de connexion à la base de données
include('db.php');

// Vérifier si le formulaire est soumis
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Récupérer les données du formulaire
    $username = $_POST['username'];
    $password = $_POST['password'];

    // Vérifier si l'utilisateur existe
    $stmt = $db->prepare("SELECT id, password FROM users WHERE username = ?");
    $stmt->execute([$username]);

    if ($stmt->rowCount() > 0) {
        // Si l'utilisateur existe, vérifier le mot de passe
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (password_verify($password, $user['password'])) {
            // Si le mot de passe est correct
            $_SESSION['username'] = $username; // Stocker le nom d'utilisateur dans la session

            // Rediriger vers la page d'accueil après une connexion réussie
            header("Location: index.php");
            exit; // Assurez-vous d'ajouter exit pour arrêter le script après la redirection
        } else {
            // Si le mot de passe est incorrect
            $error = "Mot de passe incorrect.";
        }
    } else {
        // Si l'utilisateur n'existe pas
        $error = "Utilisateur introuvable.";
    }
} else {
    // Si la méthode de requête n'est pas POST, afficher un message d'erreur
    $error = "Méthode de requête invalide.";
}
?>

<!-- <?php
// login.php - Traitement du formulaire de connexion

// Inclure le fichier de connexion à la base de données
include('db.php');

// Vérifier si le formulaire est soumis
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Récupérer les données du formulaire
    $username = $_POST['username'];
    $password = $_POST['password'];

    // Vérifier si l'utilisateur existe
    $stmt = $db->prepare("SELECT id, password FROM users WHERE username = ?");
    $stmt->execute([$username]);

    if ($stmt->rowCount() > 0) {
        // Si l'utilisateur existe, vérifier le mot de passe
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (password_verify($password, $user['password'])) {
            // Si le mot de passe est correct
            echo "Connexion réussie ! Bienvenue, " . $username;
        } else {
            // Si le mot de passe est incorrect
            echo "Mot de passe incorrect.";
        }
    } else {
        // Si l'utilisateur n'existe pas
        echo "Utilisateur introuvable.";
    }
} else {
    echo "Méthode de requête invalide.";
}
?> -->