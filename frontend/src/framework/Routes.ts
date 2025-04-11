import TfaLoginView from '@views/TfaLoginView';
import HistoryView from '@views/HistoryView';
import ProfileView from '@views/ProfileView';
import RoomView from '@views/RoomView';
import PongGameView from '@views/Pong';
import Project from '@views/Project';
import Contact from '@views/Contact';
import Home from '@views/Home';
import PrivacyPolicy from 'privacy';

export const baseLinks = {
	'/': {
		view: Home,
		label: 'Home',
	},
	'/profile': {
		view: ProfileView,
		label: 'Profile',
	},
	'/project': {
		view: Project,
		label: 'Project',
	},
	'/contact': {
		view: Contact,
		label: 'Contact',
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
