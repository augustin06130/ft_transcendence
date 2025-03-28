import { div, h2, p, button } from '@framework/tags';
import { renderApp } from 'main';

export default function popUp(title: string, message: string): boolean {
    const buttonClassName = 'px-4 py-1 border border-green-500 rounded';
    let res: number = 0;
    let result: any = div(
        {
            className: 'absolute inset-0 flex flex-col items-center justify-center bg-black/20',
            id: 'popup-id',
        },
        div(
            {
                className:
                    'flex flex-col items-center text-center border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10  -translate-y-3/4',
            },
            h2({ className: 'text-2xl font-bold mb-3' }, title),
            p({ className: 'mb-4' }, message),
            div(
                {
                    className: 'flex space-x-4',
                },
                button(
                    {
                        onclick: () => (res = 1),
                        className: buttonClassName,
                    },
                    'Confirm'
                ),
                button(
                    {
                        onclick: () => (res = 2),
                        className: buttonClassName,
                    },
                    'Cancel'
                )
            )
        )
    );
	result.style.visibility = 'visible';
    document.getElementById('entry')?.appendChild(result);
	renderApp();
    while (res === 0);
    document.getElementById('popup-id')?.remove();
    res = 0;
    return res === 1;
}
