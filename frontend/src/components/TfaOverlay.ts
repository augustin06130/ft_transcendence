import { div, h2, p, button, input, img } from '@framework/tags';
import popOver from './PopOver';
import { switchPage } from '@framework/Router';

export default class TfaOverlay {
    private div: HTMLDivElement;
    private titleLabel: HTMLHeadingElement;
    private messageLabel: HTMLParagraphElement;
    private buttonConfirm: HTMLButtonElement;
    private buttonCancel: HTMLButtonElement;
    private codeInput: HTMLInputElement;
    private qrcode: HTMLImageElement;

    constructor() {
        this.sendVerif = this.sendVerif.bind(this);
        this.hide = this.hide.bind(this);
        this.keyHandler = this.keyHandler.bind(this);

        this.titleLabel = h2({ className: 'text-2xl font-bold mb-4' }, 'Setup 2FA');
        this.messageLabel = p(
            { className: 'mb-6 text-center' },
            'Scan the qrcode with your authentificator application of choice'
        );
        this.qrcode = img({ alt: '2FA qrcode', className: 'mb-6' });
        this.codeInput = input({
            className:
                'mb-6 h-8 w-[200px] bg-black border border-green-600 p-2 pr-10  font-mono placeholder-green-500/50 focus:outline-none rounded',
            type: 'text',
            name: 'token',
            id: 'token',
            inputMode: 'numeric',
            pattern: '[0-9]*',
            autocomplete: 'one-time-code',
        });
        this.buttonConfirm = button(
            {
                onclick: this.sendVerif,
                className:
                    'px-3 py-1 border mr-3 border-green-600 rounded hover:bg-green-500/20 transition',
            },
            'CONFIRM'
        );
        this.buttonCancel = button(
            {
                onclick: this.hide,
                className:
                    'px-3 py-1 border ml-3 border-green-600 rounded hover:bg-green-500/20 transition',
            },
            'CANCEL'
        );

        this.div = div(
            {
                className:
                    'p-1 m-auto max-w-lg max-h-120 flex flex-col absolute inset-0 rounded items-center justify-center border border-green-500/30 bg-black/90',
            },

            this.titleLabel,
            this.messageLabel,
            this.qrcode,
            this.codeInput,
            div({ className: '' }, this.buttonConfirm, this.buttonCancel)
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
                this.qrcode.setAttribute('src', data.qrcode);
            })
            .catch(err => popOver.show(err));
    }

    sendVerif() {
        const body = {
            token: this.codeInput.value,
        };

        const url = new URL(`/api/tfa/verify`, window.location.href);
        fetch(url, {
            method: 'POST',
            body: JSON.stringify(body),
        })
            .then(resp => {
                if (!resp.ok) {
                    throw `Error verifying 2fa`;
                }
                this.hide();
                if (resp.status === 200) {
                    popOver.show('2FA successfully activated');
					switchPage('/profile');
                } else {
                    popOver.show('2FA could not be activated');
                }
            })
            .catch(err => popOver.show(err));
    }

    keyHandler(e: KeyboardEvent) {
        if (e.key == 'Enter') {
            this.buttonConfirm.click();
        } else if (e.key == 'Escape') {
            this.buttonCancel.click();
        }
    }

    show() {
        this.div.style.visibility = 'visible';
        window.addEventListener('keydown', this.keyHandler);
        this.getQrcode();
    }

    hide() {
        this.div.style.visibility = 'hidden';
        window.removeEventListener('keydown', this.keyHandler);
    }

    render = () => this.div;
}
