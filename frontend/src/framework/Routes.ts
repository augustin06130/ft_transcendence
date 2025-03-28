import Home from '@views/Home';
import Login from '@views/Login';
import Register from '@views/Register';
import Profile from '@views/Profile';
import Project from '@views/Project';
import Contact from '@views/Contact';
import PongGameView from '@views/Pong';
import ChatView from '@views/Chat';
import Room from '@views/Room';

export const baseLinks = {
    '/': {
        view: Home,
        label: 'Home',
    },
    '/profile': {
        view: Profile,
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
        view: Room,
        label: 'Pong',
    },
    '/chat': {
        view: ChatView,
        label: 'Chat',
    },
};

console.log(baseLinks);
