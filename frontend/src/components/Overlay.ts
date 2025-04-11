import { div, h2, p, button } from '@framework/tags';

export default class Overlay {
	private div: HTMLDivElement;
	private titleLabel: HTMLHeadingElement;
	private messageLabel: HTMLParagraphElement;
	private buttonLabel: HTMLButtonElement;
	constructor(
		title: string,
		message: string,
		labelName: string,
		onclick: () => void,
	) {
		this.titleLabel = h2({ className: 'text-2xl font-bold mb-4' }, title);
		this.messageLabel = p({ className: 'mb-6' }, message);
		this.buttonLabel = button({ onclick: onclick, className: 'px-6 py-2 border border-green-500 rounded hover:bg-green-500/20 transition', }, labelName);

		this.div = div({ className: 'absolute inset-0 flex flex-col items-center justify-center bg-black/80', },
			this.titleLabel,
			this.messageLabel,
			this.buttonLabel,
		);
		this.div.style.visibility = 'hidden';
	}

	show = () => {
		this.div.style.visibility = 'visible';
	};

	hide = () => {
		this.div.style.visibility = 'hidden';
	};

	setTitle = (title: string) => {
		this.titleLabel.innerText = title;
	};

	setMessage = (message: string) => {
		this.messageLabel.innerText = message;
	};

	showButton = () => {
		this.buttonLabel.style.visibility = 'inherit';
	};

	hideButton = () => {
		this.buttonLabel.style.visibility = 'hidden';
	};

	render = () => this.div
}
