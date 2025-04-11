import { p, div, button, ul, li } from '@framework/tags';
import popOver from '@components/PopOver';

export default function Cookies() {
    const buttonConfirm = button(
        {
            onclick: onConfirm,
            className:
                'px-3 py-1 border mr-3 border-green-600 rounded hover:bg-green-500/20 transition',
        },
        'ACCEPT'
    );
    const buttonCancel = button(
        {
            onclick: onCancel,
            className:
                'px-3 py-1 border ml-3 border-green-600 rounded hover:bg-green-500/20 transition',
        },
        'DECLINE'
    );

    function onConfirm() {
        const url = new URL(`/api/cookies`, window.location.href);
        fetch(url)
            .then(() => (window.location.href = '/'))
            .catch(err => popOver.show(err));
    }

    function onCancel() {
        window.location.href = 'https://www.google.com'; // or a more relevant fallback
    }

    return div(
        {
            className:
                'p-4 mx-auto border border-green-500/30 rounded p-4 flex-auto max-w-3/10 mb-10',
        },
        div(
            {
                className: 'text-green-400/70 text-sm mt-1',
            },
            div(
                { className: 'text-center mb-6' },
                p({ className: 'text-green-500 text-2xl font-bold tracking-wider' }, 'COOKIES'),
                p(
                    {},
                    'We use only essential cookies required for the website to function properly.'
                ),
                p({}, 'These include cookies to:'),
                ul(
                    {},
                    li({}, 'Maintain your login session (authentication)'),
                    li({}, 'Store your username and Google ID'),
                    li({}, 'Remember your cookie consent')
                ),
                p({}, 'These cookies do not track you or collect analytics.'),
                p(
                    {},
                    'By clicking "ACCEPT", you consent to the use of these necessary cookies. For more information, please review our ',
                    // Add a real link in your real component/router
                    'Privacy Policy.'
                )
            ),
            div({ className: 'flex justify-center' }, buttonConfirm, buttonCancel)
        )
    );
}
