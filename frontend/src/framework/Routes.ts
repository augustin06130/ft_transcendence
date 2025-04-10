import TfaLoginView from '@views/TfaLoginView';
import HistoryView from '@views/HistoryView';
import ProfileView from '@views/ProfileView';
import RoomView from '@views/RoomView';
import Register from '@views/Register';
import PongGameView from '@views/Pong';
import Project from '@views/Project';
import Contact from '@views/Contact';
import ChatView from '@views/Chat';
import Login from '@views/Login';
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
	'/project': {
		view: Project,
		label: 'Project',
	},
	'/contact': {
		view: Contact,
		label: 'Contact',
	},
	'/login': {
		view: Login,
		label: 'Login',
	},
	'/register': {
		view: Register,
		label: 'Register',
	},
	'/pong': {
		view: PongGameView,
		label: '',
	},
	'/room': {
		view: RoomView,
		label: 'Pong',
	},
	'/chat': {
		view: ChatView,
		label: 'Chat',
	},
	'/history': {
		view: HistoryView,
		label: 'History',
	},
	'/tfa': {
		view: TfaLoginView,
		label: '',
	},
};
