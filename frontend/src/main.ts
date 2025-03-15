import { $, Router } from "@framework/framework";
import { NavBar } from "@components/Navbar";

import Home from "@views/Home";
import Login from "@views/Login";
import Pong from "@views/Pong";

const routers = Router({
  "/": () => Home(),
  "/login": () => Login(),
  "/pong": Pong,
});

document.addEventListener("DOMContentLoaded", (event) => {
  // prettier-ignore
  $("entry", {class: "min-h-screen  w-[100vw] bg-black text-green-500 font-mono p-4"},
    NavBar(),
    routers
  );
});
