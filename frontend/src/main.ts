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


// import { $, Router } from "@framework/framework";
// import { NavBar } from "@components/Navbar";

// import Home from "@views/Home";
// import Login from "@views/Login";
// import Register from "@views/Register";
// import About from "@views/About";
// import Project from "@views/Project";
// import Contact from "@views/Contact";
// import PongGameView from "@views/Pong";
// import ChatView from "@views/Chat";
// const isLogged = false;

// function navBarRoutes(logged: boolean) {
//   const baseLinks = {
//     "/": {
//       view: Home,
//       label: "Home",
//     },
//     "/about": {
//       view: About,
//       label: "About",
//     },
//     "/project": {
//       view: Project,
//       label: "Project",
//     },
//     "/contact": {
//       view: Contact,
//       label: "Contact",
//     },
//   };

//   if (logged) {
//     return {
//       ...baseLinks,
//       "/pong": {
//         view: PongGameView,
//         label: "Pong",
//       },
//       "/chat": {
//         view: ChatView,
//         label: "Chat",
//       },
//     };
//   }
//   return {
//     ...baseLinks,
//     "/login": {
//       view: Login,
//       label: "Login",
//     },
//     // "/register": {
//     //   view: Register,
//     //   label: "Register",
//     // },
//   };
// }

// const routers = Router({
//   ...navBarRoutes(isLogged),
// });

// document.addEventListener("DOMContentLoaded", (event) => {
//   // prettier-ignore
//   $("entry", {class: "min-h-screen  w-[100vw] bg-black text-green-500 font-mono p-4"},
//     NavBar(navBarRoutes(isLogged)),
//     routers
//   );
// });
