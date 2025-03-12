// Fonction pour afficher/masquer le menu déroulant
function toggleMenu(): void {
    const menu = document.getElementById('dropdownMenu') as HTMLElement;
    // Vérifier si le menu est visible et ajuster son état
    if (menu.style.display === "none" || menu.style.display === "") {
        menu.style.display = "block";
    } else {
        menu.style.display = "none";
    }
}

// Attacher la fonction au clic sur le nom d'utilisateur
const usernameElement = document.querySelector('.username') as HTMLElement;
if (usernameElement) {
    usernameElement.addEventListener('click', toggleMenu);
}

// Fermer le menu si l'utilisateur clique ailleurs sur la page
window.addEventListener('click', (event: MouseEvent) => {
    const menu = document.getElementById('dropdownMenu') as HTMLElement;
    const username = document.querySelector('.username') as HTMLElement;
    // Vérifier si le clic est en dehors du menu ou de l'élément username
    if (username && menu && !username.contains(event.target as Node) && !menu.contains(event.target as Node)) {
        menu.style.display = 'none'; // Fermer le menu
    }
});
