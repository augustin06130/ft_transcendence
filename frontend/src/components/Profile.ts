import { div, p, form, input, label, button, span, img } from '@framework/tags';
import UseState, { UseStateType } from '@framework/UseState';
import { UserIconSVG } from '@Icon/User';
import { EmailIconSVG, PhoneIconSVG, EditIconSVG, SaveIconSVG } from '@Icon/SetupIcon';
import { isLogged } from '@framework/auth';
import { switchPage } from '@framework/Router';
import { getCookie } from 'cookies';
import popOver from './PopOver';
import Loader from './Loader';

function ProfileForm(
	handleSubmit: (e: Event) => void,
	editMode: () => boolean,
	toggleEditMode: () => void,
	username: UseStateType<string>,
	email: UseStateType<string>,
	phone: UseStateType<string>,
	bio: UseStateType<string>,
	profilePicture: UseStateType<string>
) {
	function inputL(
		id: string,
		type: string,
		state: UseStateType<string>,
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
					value: state.get(),
					event: {
						input: e => state.set((e.target as any)?.value),
					},
				})
				: div(
					{
						className:
							'w-full bg-black border border-green-500/30 p-2 text-green-500',
					},
					state.get()
				)
		);
	}

	function textareaL(
		id: string,
		state: UseStateType<string>,
		placeholder: string,
		icon: SVGSVGElement
	): HTMLDivElement {
		const textarea = document.createElement('textarea');
		textarea.id = id;
		textarea.name = id;
		textarea.className =
			'w-full bg-black border border-green-500/30 p-2 text-green-500 resize-none h-24';
		textarea.placeholder = placeholder;
		textarea.value = state.get();
		textarea.addEventListener('input', e => state.set((e.target as any)?.value));

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
					state.get()
				)
		);
	}

	function sendProfilePicture(image64: string) {
		fetch(`/api/profile/image?username=${getCookie('username')}`, {
			method: 'POST',
			body: image64,
		}).then(resp => {
			if (!resp.ok || resp.status !== 204) popOver.show('Error uploading profile picture');
		});
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
					profilePicture.set(e.target?.result as string);
					sendProfilePicture(profilePicture.get());
				};
				reader.readAsDataURL(file);
			}
		});

		return div(
			{ className: 'flex flex-col items-center space-y-3' },
			div(
				{ className: 'relative w-32 h-32 mx-auto' },
				img({
					src: profilePicture.get(),
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
		);
	}

	return div(
		{},
		p(
			{ className: ' text-xl4 text-green-500 font-bold' },
			'USER PROFILE',
			button(
				{
					className: 'hover:bg-green-500/20 gap-2 ml-2',
					event: {
						click: toggleEditMode,
					},
				},
				editMode() ? SaveIconSVG : EditIconSVG
			)
		),
		profilePictureUpload(),
		form(
			{
				className: 'space-y-4 mt-6',
				event: {
					submit: handleSubmit,
				},
			},
			inputL('username', 'text', username, 'username', UserIconSVG, true),
			inputL('email', 'email', email, 'email@example.com', EmailIconSVG),
			inputL('phone', 'tel', phone, '+1234567890', PhoneIconSVG),
			textareaL('bio', bio, 'Tell us about yourself...', UserIconSVG)
		)
	);
}

export default function Profile() {
	const username = UseState('', () => { });
	const email = UseState('', () => { });
	const phone = UseState('', () => { });
	const bio = UseState('', () => { });
	const profilePicture = UseState('', () => { });
	const editMode = UseState(false, () => { });

	function checkAuth() {
		if (!isLogged.get()) {
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
				setUserData(data);
				mainDiv.replaceChildren(getProfile());
			})
			.catch(err => {
				popOver.show(err);
			});
	}

	function toggleEditMode() {
		if (editMode.get()) {
			handleSubmit(new Event('submit'));
			editMode.set(false);
		} else {
			editMode.set(true);
		}
		mainDiv.replaceChildren(getProfile());
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (!checkAuth()) return;

		const body = {
			username: getCookie('username'),
			email: email.get(),
			phone: phone.get(),
			bio: bio.get(),
		};
		sendProfileData(body);
	}

	function sendProfileData(data: any) {
		fetch('/api/profile', {
			method: 'POST',
			body: JSON.stringify(data),
		})
			.then(response => {
				if (!response.ok) {
					throw new Error('Failed to update profile');
				}
			})
			.catch(err => {
				console.error('Error updating profile:', err);
				popOver.show(err);
			});
	}

	function setUserData(data: any) {
		username.set(data.username || '');
		email.set(data.email || '');
		phone.set(data.phone || '');
		bio.set(data.bio || '');
		profilePicture.set(data.image || '');
	}

	fetchUserProfile();

	const getProfile = () =>
		ProfileForm(
			handleSubmit,
			editMode.get,
			toggleEditMode,
			username,
			email,
			phone,
			bio,
			profilePicture
		);

	const mainDiv = div(
		{},
		Loader());

	return mainDiv;
}
