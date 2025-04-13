import { button, div, p, a } from '@framework/tags';
import { switchPage } from '@framework/Router';
import { getCookie, isLogged } from '@framework/cookies';
import GoogleSignin from './GooglesSignin';
import { Args } from '@framework/types';
import Cookies from '@views/cookies';

export function footer() {
	return div(
		{ className: 'mt-4 text-green-400/70 text-sm text-center' },
		p({}, `© ${new Date().getFullYear()} TERM_OS • All systems nominal`),
		isLogged() ? LogoutButton() : null,
		a({ href: '/privacy', className: 'text-green-400/70 text-sm hover:text-green-400/100 transition-opacity' }, ' Privacy')
	);
}

export function withTerminalHostname(cmdName: string = '') {
	return `${getCookie('username') || 'guest'}@pong:~${cmdName}`;
}

export function BoxFooter() {
	return div(
		{ className: 'mt-6 text-green-400/70 text-xs border-t border-green-500/30 pt-4' },
		p({}, `$ System time: ${new Date().toLocaleString()}`),
		p({}, '$ System status: Online')
	);
}

function LogoutButton() {
	const handleLogout = async () => {
		try {
			const url = new URL('/api/logout', window.location.href);
			const response = await fetch(url, {
				method: 'POST',
			});

			if (response.ok) {
				window.location.href = '/'
			} else {
				throw 'Error during disconnecting'
			}
		} catch (err) {
			console.error(err);
		}
	};

	return button(
		{
			onclick: handleLogout,
			className: 'text-green-400/70 text-sm hover:text-green-400/100 transition-opacity',
		},
		'Logout'
	);
}

export default function TerminalBox(label: string, ...children: Args[]) {
	const box = div(
		{
			className:
				'border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10',
		},
		div(
			{
				className: 'flex items-center gap-2 border-b border-green-500/30 pb-2 mb-4',
			},
			div({ className: 'h-3 w-3 rounded-full bg-green-500' }),
			p({ className: 'text-xs' }, withTerminalHostname(label))
		),
		...children,
		footer()
	);
	return div(
		{ className: 'mx-auto' },
		!getCookie('cookiesOn') ? Cookies() : !getCookie('tfa') ? GoogleSignin() : box
	);
}
