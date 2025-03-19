import { div, p, button, span } from "@framework/tags";
import TerminalBox from "@components/TerminalBox";
import CommandOutput from "@components/CommandOutput";
import { isLogged } from "@framework/auth";

function fakeSystemInfo() {
  const label = "$ system.info";
  const message = `OS: Terminal_OS v1.0.2
  KERNEL: RetroKernel 4.8.15
  UPTIME: 3d 7h 14m 32s
  MEMORY: 640K (should be enough for anybody)
  STATUS: All systems operational`;
  return CommandOutput(label, message);
}

function animatedCaret() {
  // prettier-ignore
  return div({ className: "mt-4 flex items-center" },
    span({ className: "text-green-400 mr-2" }, "$"),
    div({ className: "h-5 w-2 bg-green-500 animate-pulse" })
  );
}

function footer() {
  // prettier-ignore
  return div({ className: "mt-8 text-green-400/70 text-sm text-center relative" },
    p({}, `© ${new Date().getFullYear()} TERM_OS • All systems nominal`),
    isLogged.get() ? LogoutButton() : null // Afficher le bouton uniquement si l'utilisateur est connecté
  );
}

export default function Home() {
  // prettier-ignore
  const el = [
    div({ className: "space-y-4" },
      fakeSystemInfo(),
      animatedCaret()
    ),
    footer(),
  ];
  return TerminalBox("terminal@user:~", ...el);
}

// function LogoutButton() {
//   const handleLogout = async () => {
//     try {
//       const response = await fetch('/logout', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.ok) {
//         console.log('Déconnexion réussie');
//         // Mettre à jour l'état de connexion
//         isLogged.set(false);
//         // Rediriger vers la page d'accueil
//         window.dispatchEvent(new CustomEvent("url", { detail: { to: "/" } }));
//       } else {
//         // Afficher les détails de l'erreur
//         const errorMessage = await response.text();
//         console.error('Échec de la déconnexion :', response.status, errorMessage);
//       }
//     } catch (error) {
//       console.error('Erreur lors de la déconnexion :', error);
//     }
//   };

//   // prettier-ignore
//   return button({
//     onclick: handleLogout, // Appeler directement la fonction
//     className: "text-green-400/70 text-sm hover:text-green-400/100 transition-opacity absolute right-6 bottom-0",
//   }, "Logout");
// }
function LogoutButton() {
  const handleLogout = async () => {
    try {
      const response = await fetch('/logout', {
        method: 'POST', // Pas besoin de l'en-tête Content-Type
      });

      if (response.ok) {
        console.log('Déconnexion réussie');
        // Mettre à jour l'état de connexion
        isLogged.set(false);
        // Rediriger vers la page d'accueil
        window.dispatchEvent(new CustomEvent("url", { detail: { to: "/" } }));
      } else {
        // Afficher les détails de l'erreur
        const errorMessage = await response.text();
        console.error('Échec de la déconnexion :', response.status, errorMessage);
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error);
    }
  };

  // prettier-ignore
  return button({
    onclick: handleLogout, // Appeler directement la fonction
    className: "text-green-400/70 text-sm hover:text-green-400/100 transition-opacity absolute right-6 bottom-0",
  }, "Logout");
}
