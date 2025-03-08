document.addEventListener("DOMContentLoaded", () => {
    const contentDiv = document.getElementById("content");
    
    if (contentDiv) {
        contentDiv.innerHTML = "<p>Ceci est un contenu dynamique généré avec TypeScript.</p>";
    }
});
