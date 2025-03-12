<?php
session_start();
session_destroy(); // Détruire la session
header("Location: /frontend/public/index.php"); // Rediriger vers la page de connexion
exit();
?>
