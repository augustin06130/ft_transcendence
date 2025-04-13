import TerminalBox, { BoxFooter } from '@components/TerminalBox';
import { div, p, form, input, } from '@framework/tags';
import { switchPage } from '@framework/Router';
import UseState from '@framework/UseState';
import { LockIconSVG } from '@Icon/Lock';
import InputL from '@components/InputL';
import popOver from '@components/PopOver';

export default function ChangePasswordView() {
	const password = UseState('', () => { });
	const confirmPassword = UseState('', () => { });

	function handleSubmit(e: Event) {
		e.preventDefault();

		if (!password.get() || !confirmPassword.get()) {
			popOver.show('ERROR: All fields are required');
			return;
		}

		if (password.get() !== confirmPassword.get()) {
			popOver.show('ERROR: Passwords do not match');
			return;
		}

		const url = new URL('/api/profile/pass', window.location.href);
		fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				password: password.get(),
			}),
		})
			.then(resp => resp.json())
			.then(json => {
				if (!json.success)
					throw json.message
				switchPage('/profile');
			})
			.catch(err => popOver.show(err));
	}

	const formContent = form(
		{
			className: 'space-y-4',
			event: {
				submit: handleSubmit,
			},
		},
		InputL('password', 'password', password, '********', LockIconSVG),
		InputL('confirm_Password', 'password', confirmPassword, '********', LockIconSVG),
		div({ className: 'flex' },
			input({
				id: 'submit',
				type: 'submit',
				value: 'REGISTER',
				className:
					'inline w-full py-2 border border-green-500 text-green-500 hover:bg-green-500/20',
			}),
		)
	);

	return TerminalBox("/auth/passwd",
		div({ className: "mx-auto max-w-md border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10" },
			div({ className: "text-center mb-6" },
				p({ className: "text-2xl font-bold tracking-wider text-green-500" },
					"CHANGE PASSWORD"),
				p({ className: "text-green-400/70 text-sm mt-1" },
					"Enter your new password and confirmation")
			),
			formContent,
			BoxFooter(),
		),
	);
}
