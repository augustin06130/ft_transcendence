import { $, Router } from "@framework/framework";
import { NavBar } from "@components/Navbar";

import Home from "@views/Home";
import Login from "@views/Login";
import About from "@views/About";
import Project from "@views/Project";
import Contact from "@views/Contact";
import PongGame from "@views/Pong";
import PongGameView from "@views/Pong";

const isLogged = true;

function navBarRoutes(logged: boolean) {
  const baseLinks = {
    "/": {
      view: Home,
      label: "Home",
    },
    "/about": {
      view: About,
      label: "About",
    },
    "/project": {
      view: Project,
      label: "Project",
    },
    "/contact": {
      view: Contact,
      label: "Contact",
    },
  };

  if (logged) {
    return {
      ...baseLinks,
      "/pong": {
        view: PongGameView,
        label: "Pong",
      },
    };
  }
  return {
    ...baseLinks,
    "/login": {
      view: Login,
      label: "Login",
    },
  };
}

const routers = Router({
  ...navBarRoutes(isLogged),
});

document.addEventListener("DOMContentLoaded", (event) => {
  // prettier-ignore
  $("entry", {class: "min-h-screen  w-[100vw] bg-black text-green-500 font-mono p-4"},
    NavBar(navBarRoutes(isLogged)),
    routers
  );
});
