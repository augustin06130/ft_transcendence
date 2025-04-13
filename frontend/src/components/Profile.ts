import { div, p, form, label, button, span, img, textarea } from '@framework/tags';
import { EmailIconSVG, EditIconSVG, SaveIconSVG } from '@Icon/SetupIcon';
import UseState, { UseStateType } from '@framework/UseState';
import { RemoveFriendIconSVG } from '@Icon/RemoveFriend';
import { RemoveTwoFactorAuthSVG } from '@Icon/removeTfa';
import { isLogged, getCookie } from '@framework/cookies';
import { AddFriendIconSVG } from '@Icon/AddFriend';
import { TwoFactorAuthSVG } from '@Icon/addTfa';
import { switchPage } from '@framework/Router';
import { UserIconSVG } from '@Icon/User';
import TfaOverlay from './TfaOverlay';
import popOver from './PopOver';
import InputL from './InputL';
import Loader from './Loader';

function ProfileForm(
	handleSubmit: (e: Event) => void,
	editMode: () => boolean,
	toggleEditMode: () => void,
	toggleFriend: () => void,
	toggleTfa: () => void,
	username: UseStateType<string>,
	email: UseStateType<string>,
	bio: UseStateType<string>,
	profilePicture: UseStateType<string>,
	isFriend: UseStateType<boolean>,
	isTfa: UseStateType<boolean>
) {

	function textareaL(
		id: string,
		state: UseStateType<string>,
		placeholder: string,
		icon: SVGSVGElement
	): HTMLDivElement {
		return div(
			{ className: 'space-y-1' },
			label(
				{ htmlFor: id, className: 'text-sm flex items-center gap-2' },
				icon,
				span({}, `${id.toUpperCase()}:`)
			),
			textarea({
				id,
				name: id,
				className:
					'w-full bg-black border border-green-500/30 p-2 text-green-500 resize-none h-24',
				placeholder,
				value: state.get(),
				disabled: !editMode(),
				event: {
					input: e => state.set((e.target as any)?.value),
				},
			})
		);
	}

	function sendProfilePicture(image64: string) {
		const url = new URL('/api/profile/image', window.location.href);
		fetch(url, {
			method: 'POST',
			body: image64,
		}).then(resp => {
			if (!resp.ok || resp.status !== 204) {
				popOver.show('Error uploading profile picture');
			} else {
				switchPage('/profile')
			}
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
			editMode() ? fileInput : null
		);
	}

	return div(
		{},
		div(
			{ className: 'flex' },
			p({ className: 'text-xl text-green-500 font-bold' }, 'USER PROFILE'),
			username.get() === getCookie('username')
				? button(
					{
						className: 'hover:bg-green-500/20 ml-2 h-8',
						onclick: toggleEditMode,
					},
					editMode() ? SaveIconSVG : EditIconSVG
				)
				: null,
			div({ className: 'flex-auto' }),
			username.get() !== getCookie('username')
				? button(
					{
						className: 'hover:bg-green-500/20',
						onclick: toggleFriend,
					},
					isFriend.get() ? RemoveFriendIconSVG : AddFriendIconSVG
				)
				: button(
					{
						className: 'hover:bg-green-500/20',
						onclick: toggleTfa,
					},
					!isTfa.get() ? TwoFactorAuthSVG : RemoveTwoFactorAuthSVG
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
			InputL('username', 'text', username, 'username', UserIconSVG, !editMode()),
			InputL('email', 'email', email, 'email@example.com', EmailIconSVG, !editMode()),
			textareaL('bio', bio, 'Tell us about yourself...', UserIconSVG)
		)
	);
}

export default function Profile(name: string) {
	const username = UseState(name, () => { });
	const email = UseState('', () => { });
	const bio = UseState('', () => { });
	const profilePicture = UseState('', () => { });
	const isFriend = UseState(false, () => { });
	const editMode = UseState(false, () => { });
	const isTfa = UseState(false, () => { });
	const tfaOverlay = new TfaOverlay();

	function checkAuth() {
		if (!isLogged()) {
			switchPage('/login');
			return false;
		}
		return true;
	}

	async function fetchUserProfile() {
		if (!checkAuth()) return;

		const url = new URL('/api/profile', window.location.href);
		url.searchParams.set('username', username.get() as string);
		fetch(url, {
			method: 'GET',
		})
			.then(response => {
				if (!response.ok) {
					throw 'Error fetching profile';
				}
				return response.json();
			})
			.then(data => {
				setUserData(data);
				mainDiv.replaceChildren(div({}, getProfile(), tfaOverlay.render()));
			})
			.catch(err => popOver.show(err));
	}

	function toggleEditMode() {
		if (editMode.get()) {
			handleSubmit(new Event('submit'));
			editMode.set(false);
		} else {
			editMode.set(true);
		}
		mainDiv.replaceChildren(div({}, getProfile(), tfaOverlay.render()));
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (!checkAuth()) return;

		const body = {
			username: username.get(),
			email: email.get(),
			bio: bio.get(),
		};
		sendProfileData(body);
	}

	function sendProfileData(data: any) {
		const url = new URL('/api/profile', window.location.href);
		fetch(url, {
			method: 'POST',
			body: JSON.stringify(data),
		})
			.then(response => {
				if (!response.ok) {
					throw 'Error updating profile';
				}
				switchPage('/profile');
			})
			.catch(err => {
				console.error('Error updating profile:', err);
				switchPage('/profile', getCookie('username'))
				popOver.show(err);
			});
	}

	function setUserData(data: any) {
		username.set(data.username || '');
		email.set(data.email || '');
		bio.set(data.bio || '');
		profilePicture.set(data.image || '');
		isFriend.set(data.isfriend || false);
		isTfa.set(data.tfaOn || false);
	}

	function toggleFriend() {
		if (isFriend.get()) {
			friend('remove');
		} else {
			friend('add');
		}
		switchPage('/profile', username.get());
	}

	function friend(action: 'add' | 'remove') {
		const url = new URL(`/api/friend/${action}`, window.location.href);
		if (getCookie('username') === username.get()) return;
		fetch(url, {
			method: 'POST',
			body: JSON.stringify({
				username: getCookie('username'),
				friend: username.get(),
			}),
		})
			.then(resp => {
				if (!resp.ok) throw `Error ${action} friendship`;
			})
			.catch(err => popOver.show(err));
	}

	function toggleTfa() {
		if (!isTfa.get()) {
			tfaOverlay.show();
		} else {
			const url = new URL(`/api/tfa/remove`, window.location.href);
			fetch(url, {})
				.then(resp => {
					if (!resp.ok) throw `Error remvoing tfa`;
					switchPage('/profile', username.get());
				})
				.catch(err => popOver.show(err));
		}
	}

	fetchUserProfile();

	const getProfile = () =>
		ProfileForm(
			handleSubmit,
			editMode.get,
			toggleEditMode,
			toggleFriend,
			toggleTfa,
			username,
			email,
			bio,
			profilePicture,
			isFriend,
			isTfa
		);

	const mainDiv = div({}, Loader());

	return mainDiv;
}
