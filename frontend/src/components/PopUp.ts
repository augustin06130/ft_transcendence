import { div, h2, p, button } from '@framework/tags';

type PopUpElement = HTMLDivElement & { show: () => void };

export default function PopUp(option: {
    title: string;
    message: string;
    onConfirm: () => void;
    onReject: () => void;
}): PopUpElement {
    // border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10 transition-opacity duration-500 opacity-100
    const buttonClassName = 'px-4 py-1 border border-green-500 rounded';
    let result: any = div(
        {
            className: 'absolute inset-0 flex flex-col items-center justify-center bg-black/20',
        },
        div(
            {
                className:
                    'flex flex-col items-center text-center border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10  -translate-y-3/4',
            },
            h2({ className: 'text-2xl font-bold mb-3' }, option.title),
            p({ className: 'mb-4' }, option.message),
            div(
                {
                    className: 'flex space-x-4',
                },
                button(
                    {
                        onclick: () => {
                            result.style.visibility = 'hidden';
                            option.onConfirm;
                        },
                        className: buttonClassName,
                    },
                    'Confirm'
                ),
                button(
                    {
                        onclick: () => {
                            option.onReject;
                            result.style.visibility = 'hidden';
                        },
                        className: buttonClassName,
                    },
                    'Cancel'
                )
            )
        )
    );
    result.style.visibility = 'hidden';

    result.show = () => {
        result.style.visibility = 'visible';
    };

    return result;
}
