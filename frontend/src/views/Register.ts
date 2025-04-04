import { div, p, form, input, label, span } from '@framework/tags';
import TerminalBox, { BoxFooter } from '@components/TerminalBox';
import UseState from '@framework/UseState';
import { UserIconSVG } from '@Icon/User';
import { switchPage } from '@framework/Router';
import { LockIconSVG } from '@Icon/Lock';

function success(username: string) {
	// prettier-ignore
	return div({ className: "space-y-4 py-4 text-center" },
		p({ className: "text-xl text-green-400" }, "Registration successful"),
		p({ className: "text-sm mt-2" }, `Account created for ${username}`),
		div({ className: "h-2 w-2 bg-green-500 rounded-full animate-pulse" }),
		p({ className: "text-sm" }, "Redirecting to login...")
	);
}

function inputL(
	id: string,
	name: string,
	labelName: string,
	type: string,
	value: string,
	onInput: (e: Event) => void,
	placeholder: string,
	icon: SVGSVGElement
) {
	return div(
		{ className: 'space-y-1' },
		label(
			{ htmlFor: name, className: 'text-sm flex items-center gap-2' },
			icon,
			span({}, `${labelName}:`)
		),
		input({
			id: id,
			type: type,
			name: name,
			className: 'w-full bg-black border border-green-500/30 p-2 text-green-500',
			placeholder: placeholder,
			value: value,
			event: {
				input: onInput,
			},
		})
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

		fetch('/api/register', {
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
				if (!response.ok) {
					throw new Error('Échec de la connexion');
				}
				return response.json(); // Toujours parser la réponse en JSON
			})
			.then(data => {
				console.log('Réponse du serveur :', data);
				if (data.success) {
					loading.set(false);
					registerSuccess.set(true);
					switchPage('/login');
				} else {
					throw new Error(data.message || 'Échec de la connexion');
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
			inputL(
				'username',
				'username',
				'USERNAME',
				'text',
				username.get(),
				e => username.set((e.target as HTMLInputElement).value),
				'username',
				UserIconSVG
			),
			inputL(
				'email',
				'email',
				'EMAIL',
				'email',
				email.get(),
				e => email.set((e.target as HTMLInputElement).value),
				'user@example.com',
				UserIconSVG
			),
			inputL(
				'password',
				'password',
				'PASSWORD',
				'password',
				password.get(),
				e => password.set((e.target as HTMLInputElement).value),
				'********',
				LockIconSVG
			),
			inputL(
				'confirmPassword',
				'confirmPassword',
				'CONFIRM PASSWORD',
				'password',
				confirmPassword.get(),
				e => confirmPassword.set((e.target as HTMLInputElement).value),
				'********',
				LockIconSVG
			),
			error.get() ? p({ className: 'text-red-500 text-sm' }, error.get()) : null,
			input({
				id: 'submit',
				type: 'submit',
				value: loading.get() ? 'PROCESSING...' : 'REGISTER',
				className:
					'w-full py-2 border border-green-500 text-green-500 hover:bg-green-500/20',
				disabled: loading.get(),
			})
		);

	// prettier-ignore
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
