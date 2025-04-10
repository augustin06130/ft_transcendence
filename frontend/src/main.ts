import { $, Router } from '@framework/framework';
import { NavBar } from '@components/Navbar';
import { baseLinks } from '@framework/Routes';
import { Routes } from '@framework/types';
import { isLogged } from './framework/auth';
import popOver from '@components/PopOver';

function navBarRoutes(): Routes {
    const entry = document.getElementById('entry');
    if (entry) {
        entry.innerHTML = '';
    }

    if (isLogged.get()) {
        baseLinks;
        return {
            '/': baseLinks['/'],
            '/profile': baseLinks['/profile'],
            '/history': baseLinks['/history'],
            '/room': baseLinks['/room'],
            '/chat': baseLinks['/chat'],
            '/pong': baseLinks['/pong'],
        };
    } else {
        return {
            '/': baseLinks['/'],
        };
    }
}

const routers = Router({
    ...navBarRoutes(),
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
        NavBar(navBarRoutes()), // Pass the updated routes to NavBar
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
