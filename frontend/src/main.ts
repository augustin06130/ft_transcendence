import { $, Router } from "@framework/framework";
import { NavBar } from "@components/Navbar";
import { baseLinks } from "@framework/Routes";
import { Routes } from "@framework/types";
import { isLogged } from "./framework/auth";

function navBarRoutes(logged: boolean): Routes {
  const entry = document.getElementById("entry");
  if (entry) {
    entry.innerHTML = ""; // Clear the container
  }
  console.log("isLogged = ", isLogged.get());

  if (logged) {
    console.log("et tres bien loger");
    // When logged in, include Pong and Chat
    return {
      "/": baseLinks["/"],
      "/about": baseLinks["/about"],
      "/pong": baseLinks["/pong"],
      "/chat": baseLinks["/chat"],
    };
  } else {
    // When not logged in, include Login and Register
    return {
      "/": baseLinks["/"],
      "/about": baseLinks["/about"],
      "/pong": baseLinks["/pong"],
      "/chat": baseLinks["/chat"],
      "/login": baseLinks["/login"],
      "/register": baseLinks["/register"],
    };
  }
}

const routers = Router({
  ...navBarRoutes(isLogged.get()),
});

function renderApp() {
  // Get the updated routes based on the current state of isLogged
  const routes = navBarRoutes(isLogged.get());

  // Clear the existing content


  // Re-render the NavBar and Router with the updated routes
  $("entry", { class: "min-h-screen w-[100vw] bg-black text-green-500 font-mono p-4" },
    NavBar(navBarRoutes(isLogged.get())), // Pass the updated routes to NavBar
    routers // Pass the updated routes to Router
  );
}

document.addEventListener("DOMContentLoaded", (event) => {
  // Initial render
  renderApp();

  // Re-render the app whenever isLogged changes
  isLogged.subscribe(() => {
    renderApp(); // Re-render the entire app
  });
});

