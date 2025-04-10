import { div, h2, p, button, input, img } from '@framework/tags';
import popOver from './PopOver';

export default class TfaOverlay {
	private div: HTMLDivElement;
	private titleLabel: HTMLHeadingElement;
	private messageLabel: HTMLParagraphElement;
	private buttonLabel: HTMLButtonElement;
	private codeInput: HTMLInputElement;
	private qrcode: HTMLImageElement;
	private secret: string = '';

	constructor(
	) {
		this.sendVerif = this.sendVerif.bind(this);
		this.titleLabel = h2({ className: 'text-2xl font-bold mb-4' }, 'Setup 2FA');
		this.messageLabel = p({ className: 'mb-6' }, 'Scan the qrcode with your authentificator application of choice');
		this.qrcode = img({ alt: '2FA qrcode' });
		this.codeInput = input({
			className:
				'h-8 w-64 bg-black border border-green-600 p-2 pr-10  font-mono placeholder-green-500/50 focus:outline-none rounded',
			type: 'text',
			name: 'token',
			id: 'token',
			inputMode: 'numeric',
			pattern: '[0-9]*',
			autocomplete: 'one-time-code',
		});
		this.buttonLabel = button({
			onclick: this.sendVerif, className: 'px-6 py-2 border border-green-500 rounded hover:bg-green-500/20 transition',
		}, 'confirm');

		this.div = div({ className: 'absolute inset-0 flex flex-col items-center justify-center bg-black/80', },
			this.titleLabel,
			this.messageLabel,
			this.qrcode,
			this.codeInput,
			this.buttonLabel,
		);
		this.div.style.visibility = 'hidden';
	}

	getQrcode() {
		const url = new URL(`/api/tfa/add`, window.location.href);
		fetch(url)
			.then(resp => {
				if (!resp.ok) throw `Error adding 2fa`;
				return resp.json();
			})
			.then(data => {
				this.qrcode.setAttribute('src', data.qrcode)
				this.secret = data.secret;
			})
			.catch(err => popOver.show(err));
	}

	sendVerif() {
		const body = {
			token: this.codeInput.value
		}
		console.log(body);

		const url = new URL(`/api/tfa/verify`, window.location.href);
		fetch(url, {
			method: 'POST',
			body: JSON.stringify(body)
		})
			.then(resp => {
				if (!resp.ok) {
					console.log(resp); throw `Error verifying 2fa`
				};
				this.hide();
				if (resp.status === 200) {
					popOver.show('2FA successfully activated')
				} else {
					popOver.show('2FA could not be activated')
				}
			})
			.catch(err => popOver.show(err));
	}

	show() {
		this.div.style.visibility = 'visible';
		this.getQrcode();
	};


	hide() {
		this.div.style.visibility = 'hidden';
	};

	render = () => this.div
}
