import TerminalBox, { BoxFooter } from '@components/TerminalBox';
import { div, p, form, input } from '@framework/tags';
import UseState from '@framework/UseState';
import popOver from '@components/PopOver';
import { State } from '@framework/types';
import { UserIconSVG } from '@Icon/User';
import { LockIconSVG } from '@Icon/Lock';
import InputL from '@components/InputL';

function LoginForm(
	handleSubmit: (e: Event) => void,
	username: State<string>,
	password: State<string>
) {
	return form(
		{
			className: 'space-y-4',
			event: {
				submit: handleSubmit,
			},
		},
		InputL('username', 'text', username, 'username', UserIconSVG),
		InputL('password', 'password', password, '********', LockIconSVG),
		div({ className: 'flex' },
			input({
				id: 'submit',
				type: 'submit',
				className: 'inline w-full py-2 border border-green-500 text-green-500 hover:bg-green-500/20',
			})
		)
	);
}

export default function Login() {
	const username = UseState('', () => { });
	const password = UseState('', () => { });

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (!username.get() || !password.get()) {
			popOver.show('All fields are required');
			return;
		}
		const url = new URL('/api/login/pass', window.location.href);
		fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				username: username.get(),
				password: password.get(),
			}),
		})
			.then(resp => {
				console.log(resp);
				if (resp.redirected) {
					return new Promise(res => res({ success: true }));
				} else {
					return resp.json();
				}
			})
			.then(json => {
				console.log(json);
				if (!json.success)
					throw json.message;
				location.href = '/profile';
			})
			.catch(err => popOver.show(err));
	}

	return TerminalBox(
		'/auth/login',
		div(
			{
				className: `mx-auto max-w-md border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10 transition-opacity duration-500`,
			},
			div(
				{ className: 'text-center mb-6' },
				p({ className: 'text-2xl font-bold tracking-wider' }, 'SYSTEM LOGIN'),
				p(
					{ className: 'text-green-400/70 text-sm mt-1' },
					'Enter credentials to access the system'
				)
			),
			LoginForm(handleSubmit, username, password),
			BoxFooter(),
		),
	);
}
