import { $, Router } from '@framework/framework';
import { NavBar } from '@components/Navbar';
import { baseLinks } from '@framework/Routes';
import { Routes } from '@framework/types';
import { isLogged } from './framework/auth';
import popOver from '@components/PopOver';

function navBarRoutes(logged: boolean): Routes {
    const entry = document.getElementById('entry');
    if (entry) {
        entry.innerHTML = ''; // Clear the container
    }
    console.log('isLogged = ', isLogged.get());

    if (logged) {
        // When logged in, include Pong and Chat
        return {
            '/': baseLinks['/'],
            '/profile': baseLinks['/profile'],
            '/room': baseLinks['/room'],
            '/pong': baseLinks['/pong'],
            '/chat': baseLinks['/chat'],
        };
    } else {
        // When not logged in, include Login and Register
        return {
            '/': baseLinks['/'],
            '/profile': baseLinks['/profile'],
            '/room': baseLinks['/room'],
            '/pong': baseLinks['/pong'],
            '/chat': baseLinks['/chat'],
            '/login': baseLinks['/login'],
            '/register': baseLinks['/register'],
        };
    }
}

const routers = Router({
    ...navBarRoutes(isLogged.get()),
});

export function renderApp() {
    // Get the updated routes based on the current state of isLogged
    // const routes = navBarRoutes(isLogged.get());

    // Clear the existing content

    // Re-render the NavBar and Router with the updated routes
    $(
        'entry',
        // @ts-ignore
        { class: 'min-h-screen w-[100vw] bg-black text-green-500 font-mono p-4' },
        NavBar(navBarRoutes(isLogged.get())), // Pass the updated routes to NavBar
        routers, // Pass the updated routes to Router
        popOver
    );
}

document.addEventListener('DOMContentLoaded', _ => {
    renderApp();

    isLogged.subscribe(() => {
        // setTimeout(() => {
        //     renderApp(); // Re-render the entire app
        // }, 1000);
    });
});
