import { div, p, button, span } from '@framework/tags';
import TerminalBox from '@components/TerminalBox';
import CommandOutput from '@components/CommandOutput';
import { isLogged } from '@framework/auth';
import { switchPage } from '@framework/Router';

function fakeSystemInfo() {
    const label = `$ cd ${window.location.pathname}`;
    const message = `cd: no such file or directory: ${window.location.pathname}`;
    return CommandOutput(label, message);
}

function animatedCaret() {
    return div(
        { className: 'mt-4 flex items-center' },
        span({ className: 'text-green-400 mr-2' }, '$'),
        div({ className: 'h-5 w-2 bg-green-500 animate-pulse' })
    );
}

function footer() {
    return div(
        { className: 'mt-8 text-green-400/70 text-sm text-center relative' },
        p({}, `© ${new Date().getFullYear()} TERM_OS • All systems nominal`),
        isLogged.get() ? LogoutButton() : null
    );
}

export default function _404View() {
    const el = [div({ className: 'space-y-4' }, fakeSystemInfo(), animatedCaret()), footer()];
    return TerminalBox('terminal@user:~', ...el);
}

function LogoutButton() {
    const handleLogout = async () => {
        try {
            const url = new URL('/api/logout', window.location.href);
            const response = await fetch(url, {
                method: 'POST',
            });

            if (response.ok) {
                console.log('Déconnexion réussie');
                isLogged.set(false);
                switchPage('/');
            } else {
                const errorMessage = await response.text();
                console.error('Échec de la déconnexion :', response.status, errorMessage);
            }
        } catch (error) {
            console.error('Erreur lors de la déconnexion :', error);
        }
    };

    return button(
        {
            onclick: handleLogout,
            className:
                'text-green-400/70 text-sm hover:text-green-400/100 transition-opacity absolute right-6 bottom-0',
        },
        'Logout'
    );
}
