import { div } from "@framework/tags";

export default function GoogleSignin() {
	const script = document.createElement('script');
	script.setAttribute('src', 'https://accounts.google.com/gsi/client')
	return div({ className: 'inline pr-4' }, script, createGoogleSignInLoad(), createGoogleSignInButton());
}

function createGoogleSignInLoad() {
	const div = document.createElement('div');
	div.id = 'g_id_onload';
	div.setAttribute('data-client_id', '142263870589-c25b699sci1f9ti7fimmtoge0mn98qkk.apps.googleusercontent.com');
	div.setAttribute('data-context', 'signin');
	div.setAttribute('data-ux_mode', 'popup');
	div.setAttribute('data-login_uri', 'https://localhost:8080/api/login/google');
	div.setAttribute('data-auto_prompt', 'false');
	return div;
}

function createGoogleSignInButton() {
	const div = document.createElement('div');

	div.className = 'g_id_signin';
	div.setAttribute('data-type', 'icon');
	div.setAttribute('data-local', 'en');
	div.setAttribute('data-shape', 'square');
	div.setAttribute('data-theme', 'filled_black');
	div.setAttribute('data-text', 'signin_with');
	div.setAttribute('data-size', 'large');
	return div;
}
