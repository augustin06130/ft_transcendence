import { $, Router } from "@framework/framework";
import { NavBar } from "@components/Navbar";
import { baseLinks } from "@framework/Routes";
import { Routes } from "@framework/types";

const isLogged = false; // Replace this with dynamic state in a real app

function navBarRoutes(logged: boolean): Routes {
  if (logged) {
    // When logged in, include Pong and Chat
    return {
      "/": baseLinks["/"],
      "/about": baseLinks["/about"],
      "/project": baseLinks["/project"],
      "/contact": baseLinks["/contact"],
      "/pong": baseLinks["/pong"],
      "/chat": baseLinks["/chat"],
    };
  } else {
    // When not logged in, include Login and Register
    return {
      "/": baseLinks["/"],
      "/about": baseLinks["/about"],
      "/project": baseLinks["/project"],
      "/contact": baseLinks["/contact"],
      "/login": baseLinks["/login"],
      "/register": baseLinks["/register"],
    };
  }
}

const routers = Router({
  ...navBarRoutes(isLogged),
});

document.addEventListener("DOMContentLoaded", (event) => {
  // prettier-ignore
  $("entry", {class: "min-h-screen w-[100vw] bg-black text-green-500 font-mono p-4"},
    NavBar(navBarRoutes(isLogged)),
    routers
  );
});
