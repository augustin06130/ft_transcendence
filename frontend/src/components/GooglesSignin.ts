import { div } from '@framework/tags';
import TfaOverlay from './Tfa';

export default function GoogleSignin() {
	const tfa =  new TfaOverlay();
    const onload = div({ id: 'g_id_onload' });
    onload.setAttribute(
        'data-client_id',
        '142263870589-c25b699sci1f9ti7fimmtoge0mn98qkk.apps.googleusercontent.com'
    );
    onload.setAttribute('data-login_uri', 'https://localhost:8080/api/login/google');
    onload.setAttribute('data-auto_prompt', 'false');
    onload.setAttribute('data-context', 'signin');
    onload.setAttribute('data-ux-mode', 'popup');
    return div({ className: 'inline pr-4' }, onload, signin_button(), tfa.render());
}

function signin_button() {
    const res = div({ className: 'g_id_signin' });
    res.setAttribute('data-logo_alignment', 'left');
    res.setAttribute('data-shape', 'rectangular');
    res.setAttribute('data-text', 'signin_with');
    res.setAttribute('data-type', 'standard');
    res.setAttribute('data-theme', 'outline');
    res.setAttribute('data-size', 'large');
    res.setAttribute('data-locale', 'en');
    return res;
}
