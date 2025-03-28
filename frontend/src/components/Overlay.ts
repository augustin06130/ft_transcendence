import { div, h2, p, button } from '@framework/tags';

export type OverlayElement = HTMLDivElement & {
    show: () => void;
    hide: () => void;
    setTitle: (title: string) => void;
    setMessage: (message: string) => void;
    showButton: () => void;
    hideButton: () => void;
};

export default function Overlay(option: {
    title: string;
    message: string;
    labelName: string;
    onclick: () => void;
}): OverlayElement {
    let result: any = div(
        {
            className: 'absolute inset-0 flex flex-col items-center justify-center bg-black/80',
        },
        h2({ className: 'text-2xl font-bold mb-4' }, option.title),
        p({ className: 'mb-6' }, option.message),
        button(
            {
                onclick: option.onclick,
                className:
                    'px-6 py-2 border border-green-500 rounded hover:bg-green-500/20 transition',
            },
            option.labelName
        )
    );

    result.show = () => {
        result.style.visibility = 'visible';
    };

    result.hide = () => {
        result.style.visibility = 'hidden';
    };

    result.setTitle = (title: string) => {
        result.children[0].innerHTML = title;
    };

    result.setMessage = (message: string) => {
        result.children[1].innerHTML = message;
    };

    result.showButton = () => {
        result.children[2].style.visibility = 'inherit';
    };

    result.hideButton = () => {
        result.children[2].style.visibility = 'hidden';
    };

    return result;
}
