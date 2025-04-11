import TfaLoginView from '@views/TfaLoginView';
import HistoryView from '@views/HistoryView';
import ProfileView from '@views/ProfileView';
import RoomView from '@views/RoomView';
import PongGameView from '@views/Pong';
import PrivacyPolicy from 'privacy';
import Home from '@views/Home';

export const baseLinks = {
	'/': {
		view: Home,
		label: 'Home',
	},
	'/profile': {
		view: ProfileView,
		label: 'Profile',
	},
	'/pong': {
		view: PongGameView,
		label: '',
	},
	'/room': {
		view: RoomView,
		label: 'Pong',
	},
	'/history': {
		view: HistoryView,
		label: 'History',
	},
	'/tfa': {
		view: TfaLoginView,
		label: '',
	},
	'/privacy': {
		view: PrivacyPolicy,
		label: '',
	},
}
