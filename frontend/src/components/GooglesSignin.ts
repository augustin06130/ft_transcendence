import { div, script } from '@framework/tags';

export default function GoogleSignin() {
    const onload = div({ id: 'g_id_onload' });
    onload.setAttribute(
        'data-client_id',
        '142263870589-c25b699sci1f9ti7fimmtoge0mn98qkk.apps.googleusercontent.com'
    );
    onload.setAttribute('data-login_uri', 'https://localhost:8080/api/login/google');
    onload.setAttribute('data-auto_prompt', 'false');
    onload.setAttribute('data-context', 'signin');
    onload.setAttribute('data-ux-mode', 'popup');
    return div(
        { className: 'inline pr-4' },
        script({ src: 'https://accounts.google.com/gsi/client' }),
        onload,
        signin_button()
    );
}

function signin_button() {
    const res = div({ className: 'g_id_signin' });
    res.setAttribute('data-type', 'icon');
    res.setAttribute('data-shape', 'square');
    res.setAttribute('data-theme', 'filled_black');
    res.setAttribute('data-text', 'signin_with');
    res.setAttribute('data-size', 'large');
    return res;
}
