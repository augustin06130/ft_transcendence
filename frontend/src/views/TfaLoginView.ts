import { form, p, input, div } from '@framework/tags';
import TerminalBox from '@components/TerminalBox';
import popOver from '@components/PopOver';
import { switchPage } from '@framework/Router';

export default function TfaLoginView() {
	const codeInput = input({
		className:
			'w-full bg-black border border-green-500/30 p-2 text-green-500 text-center focus:outline-none text-xl',
		type: 'text',
		name: 'token',
		id: 'token',
		inputMode: 'numeric',
		pattern: '[0-9]*',
		maxLength: 6,
		minLength: 6,
		autocomplete: 'one-time-code',
	});

	const buttonLabel = input({
		type: 'submit',
		value: 'Submit',
		className: 'w-full block px-6 py-2 border border-green-500 rounded',
	}, 'confirm');


	function onsubmit(e: Event) {
		e.preventDefault();
		console.log('salut');
		const body = {
			token: codeInput.value
		}
		console.log(body);

		const url = new URL(`/api/tfa/login`, window.location.href);
		fetch(url, {
			method: 'POST',
			body: JSON.stringify(body)
		})
			.then(resp => {
				if (!resp.ok) {
					throw `Error verifying 2fa`
				};
				if (resp.status !== 200) {
					popOver.show('2FA validation failed')
				}
				else {
					window.location.href = '/profile';
				}
			})
			.catch(err => popOver.show(err));
	}

	return TerminalBox(
		'/2fa',

		div({ className: 'p-4 mx-auto border border-green-500/30 rounded p-4 flex-auto max-w-md mb-10' },
			form({
				onsubmit,
				className: 'space-y-4',
			},
				div(
					{ className: 'text-center mb-6' },
					p({ className: 'text-2xl font-bold tracking-wider' }, '2FA AUTH'),
					p(
						{ className: 'text-green-400/70 text-sm mt-1' },
						'Enter authentificator code'
					)
				),
				codeInput,
				buttonLabel
			)
		)
	);
}
