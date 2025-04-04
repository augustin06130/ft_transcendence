import { Routes } from '@framework/types';
import { div } from '@framework/tags';
import _404View from '@views/404';
import { game } from '@views/Pong';

export function Router(routes: Routes) {
	let result = div({});

	function updateUrl(event: Event) {
		const detail = (event as any).detail;

		if (!(detail.to in routes)) {
			const route404 = '/404';
			console.assert(route404 in routes);
			detail.to = route404;
		}

		result.replaceChildren(routes[detail.to].view());
		window.history.pushState('page2', '', detail.to);
		return result;
	}

	window.addEventListener('url', updateUrl);
	if (window.location.pathname in routes)
		result.replaceChildren(routes[window.location.pathname].view());
	else result.replaceChildren(_404View());

	window.addEventListener('popstate', _ => {
		const path = window.location.pathname;
		result.replaceChildren(routes[path].view());
	});
	// (result as any).refresh = syncHash;
	return result;
}

export function switchPage(to: string) {
	const from = location.pathname;

	if (from === '/pong') {
		if (game?.isPlayer() && !game.isError) {
			game.leavePopUp.show((response: boolean) => {
				if (!response)
					return;
				game?.close();
				window.dispatchEvent(new CustomEvent('url', { detail: { from, to } }));
			})
			return;
		}
		game?.close();
	}
	window.dispatchEvent(new CustomEvent('url', { detail: { from, to } }));
}
