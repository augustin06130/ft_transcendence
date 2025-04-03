import { div, p, form, input, label, span } from '@framework/tags';
import TerminalBox, { BoxFooter, footer } from '@components/TerminalBox';
import UseState from '@framework/UseState';
import UseRouter from '@framework/UseRouter';
import { State } from '@framework/types';
import { UserIconSVG } from '@Icon/User';
import { LockIconSVG } from '@Icon/Lock';
import { isLogged } from '@framework/auth';
import { switchPage } from '@framework/Router';
import popOver from '@components/PopOver';

function success(username: string) {
	return div(
		{ className: 'space-y-4 py-4 text-center' },
		p({ className: 'text-xl text-green-400' }, 'Authentication successful'),
		p({ className: 'text-sm mt-2' }, `Welcome back, ${username}`),
		div({ className: 'h-2 w-2 bg-green-500 rounded-full animate-pulse' }),
		p({ className: 'text-sm' }, 'Redirecting to system...')
	);
}

function LoginForm(
	handleSubmit: (e: Event) => void,
	error: () => string,
	loading: () => boolean,
	username: State<string>,
	password: State<string>
) {
	function inputL(
		id: string,
		name: string,
		labelName: string,
		type: string,
		value: () => string,
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
				value: value(),
				event: {
					input: onInput,
				},
			})
		);
	}

	const err = error();
	return form(
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
			username.get,
			e => username.set((e.target as any)?.value),
			'username',
			UserIconSVG
		),
		inputL(
			'password',
			'password',
			'PASSWORD',
			'password',
			password.get,
			e => password.set((e.target as any)?.value),
			'********',
			LockIconSVG
		),
		err ? p({ className: 'text-red-500 text-sm' }, error()) : null,
		input({
			id: 'submit',
			type: 'submit',
			className: 'w-full py-2 border border-green-500 text-green-500 hover:bg-green-500/20',
		})
	);
}

export default function Login() {
	const username = UseState('', () => { });
	const password = UseState('', () => { });
	const error = UseState('', () => { });
	const loading = UseState(false, () => { });
	const loginSuccess = UseState(false, () => { });
	const isMounted = UseState(false, () => { });

	const handleMount = () => {
		isMounted.set(true);
		return () => {
			isMounted.set(false);
		};
	};

	handleMount();

	function handleSubmit(e: Event) {
		e.preventDefault();
		error.set('');
		if (!username.get() || !password.get()) {
			error.set('ERROR: All fields are required');
			return;
		}
		loading.set(true);
		fetch('/login-user', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				username: username.get(),
				password: password.get(),
			}),
		})
			.then(response => {
				if (!response.ok) {
					throw new Error('Connexion failed');
				}
				return response.json();
			})
			.then(data => {
				if (data.success) {
					loading.set(false);
					loginSuccess.set(true);
					isLogged.set(true);
					setTimeout(() => switchPage('/'), 1000);
				} else {
					throw new Error('Connexion failed');
				}
			})
			.catch(err => {
				popOver.show(err);
				error.set(err.message);
				loading.set(false);
			});
	}

	const formContent = loginSuccess.get()
		? success(username.get())
		: LoginForm(handleSubmit, error.get, loading.get, username, password);

	return TerminalBox(
		'/auth/login',
		div(
			{
				className: `mx-auto max-w-md border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10 transition-opacity duration-500 ${isMounted.get() ? 'opacity-100' : 'opacity-0'}`,
			},
			div(
				{ className: 'text-center mb-6' },
				p({ className: 'text-2xl font-bold tracking-wider' }, 'SYSTEM LOGIN'),
				p(
					{ className: 'text-green-400/70 text-sm mt-1' },
					'Enter credentials to access the system'
				)
			),
			formContent,
			BoxFooter(),
		),
		footer()
	);
}
