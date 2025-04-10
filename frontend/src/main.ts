import { $, Router } from '@framework/framework';
import { baseLinks } from '@framework/Routes';
import { isLogged } from './framework/auth';
import { NavBar } from '@components/Navbar';
import { Routes } from '@framework/types';
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
            '/pong': baseLinks['/pong'],
            '/privacy': baseLinks['/privacy'],
        };
    } else {
        return {
            '/': baseLinks['/'],
            '/tfa': baseLinks['/tfa'],
            '/privacy': baseLinks['/privacy'],
        };
    }
}

const routers = Router({
    ...navBarRoutes(),
});

document.addEventListener('DOMContentLoaded', _ => {
    $(
        'entry',
        // @ts-ignore
        { class: 'min-h-screen w-[100vw] bg-black text-green-500 font-mono p-4' },
        NavBar(navBarRoutes()),
        routers,
        popOver
    );
});
