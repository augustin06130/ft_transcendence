import { div, h2 } from '@framework/tags';

export default class TournamentOverlay {
    private div: HTMLDivElement;
    private titleLabel: HTMLHeadingElement;
    constructor(title: string) {
        this.titleLabel = h2({ className: 'text-2xl font-bold mb-4' }, title);

        this.div = div(
            { className: 'absolute inset-0 flex flex-col items-center justify-center bg-black/80' },
            this.titleLabel
        );
        this.div.style.visibility = 'hidden';
        this.div.addEventListener('click', () => this.hide());
    }

    setHtml = (html: string) => {
        this.div.replaceChildren(div({}, ...html.split('\n').map(line => div({}, line))));
    };

    show = () => {
        this.div.style.visibility = 'visible';
    };

    hide = () => {
        this.div.style.visibility = 'hidden';
    };

    render = () => this.div;
}
