// Fonction pour charger dynamiquement le contenu d'une page en fonction de l'URL
function loadPage(url: string): void {
    const contentDiv = document.getElementById('content')!;
    contentDiv.innerHTML = 'Loading...'; // Affichage temporaire pendant le chargement

    // Chargement dynamique du contenu en fonction de l'URL
    switch (url) {
        case '/':
            contentDiv.innerHTML = '<h2>Welcome to ft_transcendence!</h2><p>This is the home page.</p>';
            break;
        case '/about':
            contentDiv.innerHTML = '<h2>About Us</h2><p>Learn more about our project.</p>';
            break;
        case '/contact':
            contentDiv.innerHTML = '<h2>Contact Us</h2><p>Reach out to us via email at contact@ft_transcendence.com.</p>';
            break;
        default:
            contentDiv.innerHTML = '<h2>404 Page Not Found</h2>';
            break;
    }
}

// Fonction pour gérer la navigation sans recharger la page
function setupNavigation(): void {
    const homeLink = document.getElementById('home-link')!;
    const aboutLink = document.getElementById('about-link')!;
    const contactLink = document.getElementById('contact-link')!;

    // Ajouter un événement de clic pour la page d'accueil
    homeLink.addEventListener('click', (event) => {
        event.preventDefault();
        history.pushState({}, '', '/'); // Met à jour l'URL sans recharger la page
        loadPage('/'); // Charge la page d'accueil
    });

    // Ajouter un événement de clic pour la page À propos
    aboutLink.addEventListener('click', (event) => {
        event.preventDefault();
        history.pushState({}, '', '/frontend/public/login.html'); // Met à jour l'URL sans recharger la page
        loadPage('/login'); // Charge la page "About"
    });

    // Ajouter un événement de clic pour la page Contact
    contactLink.addEventListener('click', (event) => {
        event.preventDefault();
        history.pushState({}, '', '/frontend/public/register.html'); // Met à jour l'URL sans recharger la page
        loadPage('/contact'); // Charge la page "Contact"
    });

    // Charger la page initiale en fonction de l'URL actuelle
    const currentPath = window.location.pathname;
    loadPage(currentPath);
}

// Ajouter un événement pour gérer l'historique de navigation (quand l'utilisateur appuie sur le bouton "Retour" du navigateur)
window.addEventListener('popstate', () => {
    loadPage(window.location.pathname); // Charger le contenu en fonction de l'URL actuelle
});

// Appel de la fonction pour configurer la navigation
setupNavigation();
