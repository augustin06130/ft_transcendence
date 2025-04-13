import TerminalBox, { BoxFooter } from '@components/TerminalBox';
import { div, p, form, input, } from '@framework/tags';
import { switchPage } from '@framework/Router';
import UseState from '@framework/UseState';
import { UserIconSVG } from '@Icon/User';
import { LockIconSVG } from '@Icon/Lock';
import InputL from '@components/InputL';

function success(username: string) {
	return div({ className: "space-y-4 py-4 text-center" },
		p({ className: "text-xl text-green-400" }, "Registration successful"),
		p({ className: "text-sm mt-2" }, `Account created for ${username}`),
		div({ className: "h-2 w-2 bg-green-500 rounded-full animate-pulse" }),
		p({ className: "text-sm" }, "Redirecting to login...")
	);
}


export default function Register() {
	const username = UseState('', () => { });
	const email = UseState('', () => { });
	const password = UseState('', () => { });
	const confirmPassword = UseState('', () => { });
	const error = UseState('', () => { });
	const loading = UseState(false, () => { });
	const registerSuccess = UseState(false, () => { });

	function handleSubmit(e: Event) {
		e.preventDefault();
		error.set('');

		if (!username.get() || !email.get() || !password.get() || !confirmPassword.get()) {
			error.set('ERROR: All fields are required');
			return;
		}

		if (password.get() !== confirmPassword.get()) {
			error.set('ERROR: Passwords do not match');
			return;
		}

		loading.set(true);

		const url = new URL('/api/register', window.location.href);
		fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				username: username.get(),
				email: email.get(),
				password: password.get(),
			}),
		})
			.then(response => {
				console.log('response', response);
				if (!response.ok) {
					throw new Error('Connexion failed');
				}
				return response.json();
			})
			.then(data => {
				console.log('data', data);
				if (data.success) {
					loading.set(false);
					registerSuccess.set(true);
					switchPage('/login');
				} else {
					throw new Error(data.message || 'Connexion failed');
				}
			})
			.catch(err => {
				console.error('Registration failed: ', err);
				error.set(err.message);
				loading.set(false);
			});
	}

	const formContent = registerSuccess.get()
		? success(username.get())
		: form(
			{
				className: 'space-y-4',
				event: {
					submit: handleSubmit,
				},
			},
			InputL(
				'username',
				'text',
				username,
				'username',
				UserIconSVG,
				false
			),
			InputL(
				'email',
				'email',
				email,
				'user@example.com',
				UserIconSVG,
				false
			),
			InputL(
				'password',
				'password',
				password,
				'********',
				LockIconSVG,
				false,
			),
			InputL(
				'confirmPassword',
				'password',
				confirmPassword,
				'********',
				LockIconSVG,
				false
			),
			error.get() ? p({ className: 'text-red-500 text-sm' }, error.get()) : null,
			div({ className: 'flex' },
				input({
					id: 'submit',
					type: 'submit',
					value: loading.get() ? 'PROCESSING...' : 'REGISTER',
					className:
						'inline w-full py-2 border border-green-500 text-green-500 hover:bg-green-500/20',
					disabled: loading.get(),
				}),
			)
		);


	return TerminalBox("/auth/register",
		div({ className: "mx-auto max-w-md border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10" },
			div({ className: "text-center mb-6" },
				p({ className: "text-2xl font-bold tracking-wider text-green-500" },
					"SYSTEM REGISTRATION"),
				p({ className: "text-green-400/70 text-sm mt-1" },
					"Create new credentials to access the system")
			),
			formContent,
			BoxFooter(),
		),
	);
}
