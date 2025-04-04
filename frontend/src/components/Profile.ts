import { div, p, form, input, label, button, span, img } from '@framework/tags';
import UseState from '@framework/UseState';
import { UserIconSVG } from '@Icon/User';
import { EmailIconSVG, PhoneIconSVG, EditIconSVG, SaveIconSVG } from '@Icon/SetupIcon';
import { isLogged } from '@framework/auth';
import { switchPage } from '@framework/Router';
import { getCookie } from 'cookies';
import popOver from './PopOver';

function ProfileForm(
	handleSubmit: (e: Event) => void,
	editMode: () => boolean,
	toggleEditMode: () => void,
	username: string,
	email: string,
	phone: string,
	bio: string,
	profilePicture: string
) {
	function inputL(
		id: string,
		type: string,
		value: () => string,
		onInput: (e: Event) => void,
		placeholder: string,
		icon: SVGSVGElement,
		disabled: boolean = false
	): HTMLDivElement {
		return div(
			{ className: 'space-y-1' },
			label(
				{ htmlFor: id, className: 'text-sm flex items-center gap-2' },
				icon,
				span({}, `${id.toUpperCase()}:`)
			),
			editMode() && !disabled
				? input({
					id: id,
					type: type,
					name: id,
					className: 'w-full bg-black border border-green-500/30 p-2 text-green-500',
					placeholder: placeholder,
					value: value(),
					event: {
						input: onInput,
					},
				})
				: div(
					{
						className:
							'w-full bg-black border border-green-500/30 p-2 text-green-500',
					},
					value()
				)
		);
	}

	function textareaL(
		id: string,
		value: () => string,
		onInput: (e: Event) => void,
		placeholder: string,
		icon: SVGSVGElement
	): HTMLDivElement {
		const textarea = document.createElement('textarea');
		textarea.id = id;
		textarea.name = id;
		textarea.className =
			'w-full bg-black border border-green-500/30 p-2 text-green-500 resize-none h-24';
		textarea.placeholder = placeholder;
		textarea.value = value();
		textarea.addEventListener('input', onInput);

		return div(
			{ className: 'space-y-1' },
			label(
				{ htmlFor: id, className: 'text-sm flex items-center gap-2' },
				icon,
				span({}, `${id.toUpperCase()}:`)
			),
			editMode()
				? textarea
				: div(
					{
						className:
							'w-full bg-black border border-green-500/30 p-2 text-green-500 min-h-24',
					},
					value()
				)
		);
	}

	function profilePictureUpload(): HTMLDivElement {
		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.id = 'profile-picture';
		fileInput.name = 'profile-picture';
		fileInput.accept = 'image/*';
		fileInput.className = 'hidden';
		fileInput.addEventListener('change', e => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = e => {
					profilePicture = (e.target?.result as string);
				};
				reader.readAsDataURL(file);
			}
		});

		return div(
			{ className: 'flex flex-col items-center space-y-3' },
			div(
				{ className: 'relative w-32 h-32 mx-auto' },
				img({
					src: profilePicture || '/default-avatar.png',
					alt: 'Profile Picture',
					className: 'w-32 h-32 rounded-full border-2 border-green-500 object-cover',
				}),
				editMode()
					? div(
						{
							className:
								'absolute bottom-0 right-0 bg-black border border-green-500 rounded-full p-1 cursor-pointer hover:bg-green-500/20',
							event: {
								click: () => fileInput.click(),
							},
						},
						EditIconSVG
					)
					: null
			),
			editMode() ? fileInput : null,
			editMode()
				? p(
					{ className: 'text-xs text-green-400/70' },
					'Click the edit icon to change your profile picture'
				)
				: null
		);
	}


	return div(
		{ className: 'space-y-6' },
		div(
			{ className: 'flex justify-between items-center' },
			button({
				className: "border border-green-500 text-green-500 px-3 py-1 hover:bg-green-500/20 flex items-center gap-2",
				event: {
					click: toggleEditMode
				}
			}, ...(editMode() ? [SaveIconSVG, "Save"] : [EditIconSVG, "Edit"]))
		),

		profilePictureUpload(),

		form(
			{
				className: 'space-y-4 mt-6',
				event: {
					submit: handleSubmit,
				},
			},
			inputL('username', 'text', () => username, e => username = ((e.target as any)?.value), 'username', UserIconSVG, true),
			inputL('email', 'email', () => email, e => email = ((e.target as any)?.value), 'email@example.com', EmailIconSVG),
			inputL('phone', 'tel', () => phone, e => phone = ((e.target as any)?.value), '+1234567890', PhoneIconSVG),
			textareaL('bio', () => bio, e => bio = ((e.target as any)?.value), 'Tell us about yourself...', UserIconSVG),
		)
	);
}

export default function Profile() {

	let username: string;
	let email: string;
	let phone: string;
	let bio: string;
	let profilePicture: string;
	const editMode = UseState(false, () => { });

	function checkAuth() {
		if (!isLogged.get()) {
			console.log('User not logged in, redirecting to login page');
			switchPage('/login');
			return false;
		}
		return true;
	}

	async function fetchUserProfile() {
		if (!checkAuth()) return;

		fetch(`./api/profile?username=${getCookie('username')}`, {
			method: 'GET',
		})
			.then(response => {
				if (!response.ok) {
					throw new Error('Failed to fetch profile data');
				}
				return response.json();
			})
			.then(data => {
				setUserData(data)
				mainDiv.replaceChildren(getProfile());
			})
			.catch(err => {
				popOver.show(err);
			});
	}

	function toggleEditMode() {
		if (editMode.get()) {
			handleSubmit(new Event('submit'));
		} else {
			editMode.set(true);
		}
		mainDiv.replaceChildren(getProfile())
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (!checkAuth()) return;

		const body = {
			username: getCookie('username'), email, phone, bio
		};
		// const formData = new FormData();
		// formData.append('email', email);
		// formData.append('phone', phone);
		// formData.append('bio', bio);

		// if (profilePicture && profilePicture.startsWith('data:')) {
		// 	const base64Response = fetch(profilePicture);
		// 	base64Response
		// 		.then(res => res.blob())
		// 		.then(blob => {
		// 			formData.append('profilePicture', blob, 'profile-image.jpg');
		// 			sendProfileUpdate(formData);
		// 		});
		// } else {
		// formData.append('profilePictureUrl', profilePicture)
		sendProfileUpdate(body);
		// }
	}

	function sendProfileUpdate(data: any) {
		fetch('/api/profile', {
			method: 'POST',
			body: JSON.stringify(data)
		})
			.then(response => {
				if (!response.ok) {
					throw new Error('Failed to update profile');
				}
				return response.json();
			})
			.then(data => {
				if (!data.success) {
					throw new Error('Failed to update profile');
				}
				editMode.set(false);
				if (data.profile) {
					setUserData(data.profile)
				}
			})
			.catch(err => {
				console.error('Error updating profile:', err);
				popOver.show(err);
			});
	}

	function setUserData(data: any) {
		username = data.username || '';
		email = data.email || '';
		phone = data.phone || '';
		bio = data.bio || '';
		profilePicture = data.profilePicture || '';
	}

	fetchUserProfile();

	const getProfile = () => ProfileForm(
		handleSubmit,
		editMode.get,
		toggleEditMode,
		username,
		email,
		phone,
		bio,
		profilePicture
	)

	const mainDiv = div({},
		div(
			{
				className:
					'mx-auto max-w-md border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10',
			},
			div(
				{ className: 'text-center py-8' },
				p({ className: 'text-xl text-green-500' }, 'Loading profile data...'),
				div(
					{ className: 'mt-4 flex justify-center' },
					div({ className: 'h-2 w-2 bg-green-500 rounded-full animate-pulse mr-1' }),
					div({ className: 'h-2 w-2 bg-green-500 rounded-full animate-pulse mr-1' }),
					div({ className: 'h-2 w-2 bg-green-500 rounded-full animate-pulse' })
				)
			)
		)
	);

	return mainDiv;
}
