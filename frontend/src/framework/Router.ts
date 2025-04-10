import { Routes } from '@framework/types';
import { div } from '@framework/tags';
import { game } from '@views/Pong';
import _404View from '@views/404';

export function Router(routes: Routes) {
	let result = div({});

	function updateUrl(event: Event) {
		const detail = (event as any).detail;

		if (!(detail.to in routes)) {
			const route404 = '/404';
			detail.to = route404;
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
	// (result as any).refresh = syncHash;
	return result;
}

export function switchPage(to: string, arg: string | null = null) {
	const from = location.pathname;

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
