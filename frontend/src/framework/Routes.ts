import Home from "@views/Home";
import Login from "@views/Login";
import Register from "@views/Register";
import About from "@views/About";
import Project from "@views/Project";
import Contact from "@views/Contact";
import PongGameView from "@views/Pong";
import ChatView from "@views/Chat";

export const baseLinks = {
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
  "/login": {
    view: Login,
    label: "Login",
  },
  "/register": {
    view: Register,
    label: "Register",
  },
  "/pong": {
    view: PongGameView,
    label: "Pong",
  },
  "/chat": {
    view: ChatView,
    label: "Chat",
  },
};

console.log(baseLinks);
