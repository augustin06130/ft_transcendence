import { nav, div, span, ul, li, switchPage } from '@framework/framework';
import Link from '@framework/Link';
import UserSearch from './UserSearch';
import { isLogged } from '@framework/auth';

function navBarLink(link: string, label: string) {
	const linkClass = 'hover:text-green-400 hover:underline';
	return Link({ className: linkClass }, link, `[${label.toUpperCase()}]`);
}

function terminalTypewriter(text: string, containerId: string) {
	const startTypewriter = () => {
		const container = document.getElementById(containerId);
		if (!container) return;

		container.textContent = '';
		let currentText = '';
		let currentIndex = 0;

		const typeNextChar = () => {
			if (currentIndex < text.length) {
				currentText += text[currentIndex];
				container.textContent = currentText;
				currentIndex++;
				setTimeout(typeNextChar, 150);
			} else {
				const cursor = document.createElement('span');
				cursor.className = 'inline-block w-2 h-4 bg-green-500 ml-1 animate-pulse';
				container.appendChild(cursor);
			}
		};

		typeNextChar();
	};

	setTimeout(startTypewriter, 100);

	return span(
		{
			id: containerId,
			className: 'text-xl font-bold tracking-wider font-mono',
			onclick: () => {
				switchPage('/');
			},
		},
		''
	);
}

export function NavBar(routes: { [key: string]: { label: string } }) {
	const userSearch = new UserSearch();
	const buttons = Object.entries(routes)
		.filter(route => route[1].label)
		.map(route => navBarLink(route[0], route[1].label));

	return nav(
		{ className: 'border-b border-green-500/30 pb-2 mb-8' },
		div(
			{ className: 'mx-auto flex items-center justify-between' },
			div(
				{ className: 'flex items-center gap-2' },
				terminalTypewriter('ft_transcendence', 'terminal-text')
			),
			ul(
				{ className: 'flex gap-6' },
				isLogged.get() ? userSearch.render() : null,
				...buttons.map(b => li({ className: 'm-auto' }, b))
			)
		)
	);
}
