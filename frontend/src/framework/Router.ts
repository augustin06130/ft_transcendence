import { Routes } from '@framework/types';
import { div } from '@framework/tags';
import { game } from '@views/Pong';
import _404View from '@views/404';
import { getCookie, isLogged } from './cookies';

export function Router(routes: Routes) {
    let result = div({});

    function updateUrl(event: Event) {
        const detail = (event as any).detail;

        if (getCookie('tfa') === '1') {
            detail.to = '/tfa';
        }
        if (!(detail.to in routes)) {
            detail.to = '/404';
        }

        if (routes[detail.to]) {
            if (detail.arg) {
                result.replaceChildren(routes[detail.to].view(detail.arg));
            } else {
                result.replaceChildren(routes[detail.to].view());
            }
        }

        window.history.pushState('page2', '', detail.to);
        return result;
    }

    window.addEventListener('url', updateUrl);

    if (window.location.pathname in routes) {
        result.replaceChildren(routes[window.location.pathname].view());
    } else {
        result.replaceChildren(_404View());
    }

    window.addEventListener('popstate', _ => {
        const path = window.location.pathname;
        result.replaceChildren(routes[path].view());
    });
    return result;
}

const urls = new Set<string>(['', '/', '/register', '/login', '/privacy']);

export function switchPage(to: string, arg: string | null = null) {
    const from = location.pathname;

    if (!isLogged() && !urls.has(to)) {
        location.href = '/';
        location.reload();
        return;
    }

    if (from === '/pong') {
        if (game?.isPlayer() && !game.isError) {
            game.leavePopUp.show((response: boolean) => {
                if (!response) return;
                game?.close();
                window.dispatchEvent(new CustomEvent('url', { detail: { from, to, arg } }));
            });
            return;
        }
        game?.close();
    }

    window.dispatchEvent(new CustomEvent('url', { detail: { from, to, arg } }));
}
