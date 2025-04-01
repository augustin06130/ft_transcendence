import { nav, div, span, ul, li, switchPage } from '@framework/framework';
import Link from '@framework/Link';

function navBarLink(link: string, label: string) {
    const linkClass = 'hover:text-green-400 hover:underline';
    return Link({ className: linkClass }, link, `[${label.toUpperCase()}]`);
}

function terminalTypewriter(text: string, containerId: string) {
    // Cette fonction démarre l'effet de machine à écrire
    const startTypewriter = () => {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.textContent = ''; // Effacer le contenu initial
        let currentText = '';
        let currentIndex = 0;

        const typeNextChar = () => {
            if (currentIndex < text.length) {
                currentText += text[currentIndex];
                container.textContent = currentText;
                currentIndex++;
                setTimeout(typeNextChar, 150); // Vitesse de frappe (150 ms par caractère)
            } else {
                const cursor = document.createElement('span');
                cursor.className = 'inline-block w-2 h-4 bg-green-500 ml-1 animate-pulse';
                container.appendChild(cursor);
            }
        };

        typeNextChar();
    };

    // Démarrer l'effet après un court délai pour s'assurer que l'élément est dans le DOM
    setTimeout(startTypewriter, 100);

    // Retourner le span avec l'ID
    return span(
        {
            id: containerId,
            className: 'text-xl font-bold tracking-wider font-mono',
            onclick: () => {
                switchPage('/');
            },
        },
        '' // Le texte est vide au départ, il sera rempli par l'effet de machine à écrire
    );
}

export function NavBar(routes: { [key: string]: { label: string } }) {
    const buttons = Object.entries(routes)
        .filter(route => route[1].label)
        .map(route => navBarLink(route[0], route[1].label));

    // prettier-ignore
    return nav(
    { className: "border-b border-green-500/30 pb-2 mb-8" },
    div(
      { className: "mx-auto flex items-center justify-between" },
      div({ className: "flex items-center gap-2" }, terminalTypewriter("ft_transcendence", "terminal-text")),
      ul({ className: "flex gap-6" }, ...buttons.map((b) => li({}, b))),
    ),
  );
}
