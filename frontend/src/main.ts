import { $, router, h1 } from './framework';
import Home from './Home';
import { NavBar } from './navbar';


document.addEventListener("DOMContentLoaded", (event) => {
    $('entry', { class: "min-h-screen  w-[100vw] bg-black text-green-500 font-mono p-4" },
        NavBar(),
        Home(),
    )
  });

