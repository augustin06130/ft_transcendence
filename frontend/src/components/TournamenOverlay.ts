import { div, h2 } from '@framework/tags';

export default class TournamentOverlay {
	private div: HTMLDivElement;
	private container: HTMLDivElement;
	private titleLabel: HTMLHeadingElement;
	constructor(title: string) {
		this.titleLabel = h2({ className: 'text-2xl font-bold mb-4' }, title);

		this.container = div(
			{ className: 'absolute inset-0 flex flex-col items-center justify-center bg-black/80' },
			this.titleLabel
		);
		this.div = div({ className: 'absolute inset-0 flex flex-col items-center justify-center bg-black/80', },
			div({ className: 'px-6 py-2 border border-green-500 rounded hover:bg-green-500/20 transition' },
				this.titleLabel,
				this.container,
			)
		);
		this.div.style.visibility = 'hidden';
		this.div.addEventListener('click', () => this.hide());
	}

	setHtml = (html: string) => {
		this.container.replaceWith(div({ }, ...html.split('\n').map(line => div({}, line))));
	};

	show = () => {
		this.div.style.visibility = 'visible';
	};

	hide = () => {
		this.div.style.visibility = 'hidden';
	};

	render = () => this.div;
}
