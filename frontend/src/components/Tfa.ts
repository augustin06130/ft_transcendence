import { div, h2 } from '@framework/tags';

export default class TfaOverlay {
    private div: HTMLDivElement;
    private titleLabel: HTMLHeadingElement;
    constructor() {
        this.titleLabel = h2({ className: ' font-bold mb-4' }, 'tournament tree:');
        this.div = this.getCore('')
        this.div.style.visibility = 'hidden';
        this.div.addEventListener('click', () => this.hide());
    }
    getCore = (html: string = '') => {
        return div(
            { className: 'absolute inset-0 flex flex-col items-center justify-center bg-black/80' },
            div(
                { className: 'px-6 py-2 border border-green-500 rounded bg-black' },
                this.titleLabel,
                ...html.split('\n').map(line => div({}, line))
            )
        );
    };

    show = () => {
        this.div.style.visibility = 'visible';
    };

    hide = () => {
        this.div.style.visibility = 'hidden';
    };

    render = () => this.div;
}

