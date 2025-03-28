import { div, h2, p, button } from '@framework/tags';

export default function PopUp(option: {
    title: string;
    message: string;
    onConfirm: () => void;
    onReject: () => void;
}): HTMLElement {
    return div(
        {
            className: 'absolute inset-0 flex flex-col items-center justify-center bg-black/80',
        },
        h2({ className: 'text-2xl font-bold mb-4' }, option.title),
        p({ className: 'mb-6' }, option.message),
        button(
            {
                onclick: option.onConfirm,
                className:
                    'px-6 py-2 border border-green-500 rounded hover:bg-green-500/20 transition',
            },
			'Confirm'
        ),
		button(
            {
                onclick: option.onReject,
                className:
                    'px-6 py-2 border border-green-500 rounded hover:bg-green-500/20 transition',
            },
			'Cancel'
        )
    );
}
