// const isLogged = true; // Replace this with dynamic state in a real app

// import { $, Router } from "@framework/framework";
// import { NavBar } from "@components/Navbar";
// import { baseLinks } from "@framework/Routes";
// import { Routes } from "@framework/types";
// // import { isLogged } from "./framework/auth";

// function navBarRoutes(logged: boolean): Routes {
//   // console.log("isLogged = ", isLogged.get());

//   if (logged) {
//     // When logged in, include Pong and Chat
//     return {
//       "/": baseLinks["/"],
//       "/about": baseLinks["/about"],
//       "/project": baseLinks["/project"],
//       "/contact": baseLinks["/contact"],
//       "/pong": baseLinks["/pong"],
//       "/chat": baseLinks["/chat"],
//     };
//   } else {
//     // When not logged in, include Login and Register
//     return {
//       "/": baseLinks["/"],
//       "/about": baseLinks["/about"],
//       "/project": baseLinks["/project"],
//       "/contact": baseLinks["/contact"],
//       "/login": baseLinks["/login"],
//       "/register": baseLinks["/register"],
//     };
//   }
// }

// const routers = Router({
//   ...navBarRoutes(isLogged),
// });

// document.addEventListener("DOMContentLoaded", (event) => {
//   // prettier-ignore
//   $("entry", {class: "min-h-screen w-[100vw] bg-black text-green-500 font-mono p-4"},
//     NavBar(navBarRoutes(isLogged)),
//     routers
//   );
// });









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


// import { $, Router } from "@framework/framework";
// import { NavBar } from "@components/Navbar";
// import { baseLinks } from "@framework/Routes";
// import { Routes } from "@framework/types";
// import { isLogged } from "./framework/auth";

// // Global variables for routes and router
// let currentRoutes: Routes = {}; // Properly typed as Routes
// let router;

// function navBarRoutes(logged: boolean): Routes {
//   console.log("isLogged = ", logged);

//   if (logged) {
//     console.log("et tres bien loger");
//     // When logged in, include Pong and Chat
//     return {
//       "/": baseLinks["/"],
//       "/about": baseLinks["/about"],
//       "/project": baseLinks["/project"],
//       "/contact": baseLinks["/contact"],
//       "/pong": baseLinks["/pong"],
//       "/chat": baseLinks["/chat"],
//     };
//   } else {
//     // When not logged in, include Login and Register
//     return {
//       "/": baseLinks["/"],
//       "/about": baseLinks["/about"],
//       "/project": baseLinks["/project"],
//       "/contact": baseLinks["/contact"],
//       "/login": baseLinks["/login"],
//       "/register": baseLinks["/register"],
//     };
//   }
// }

// // This function will handle login state changes
// function handleLoginStateChange() {
//   // First, redirect to a safe route before updating the routes
//   if (isLogged.get()) {
//     // If we've just logged in and we're on a non-logged-in route like /login
//     if (window.location.pathname === "/login" || window.location.pathname === "/register") {
//       window.location.href = "/"; // Hard redirect to home
//       return; // Exit early, the page will reload
//     }
//   } else {
//     // If we've just logged out and we're on a logged-in-only route like /pong
//     if (window.location.pathname === "/pong" || window.location.pathname === "/chat") {
//       window.location.href = "/"; // Hard redirect to home
//       return; // Exit early, the page will reload
//     }
//   }

//   // If we didn't need to redirect, just re-render
//   renderApp();
// }

// function renderApp() {
//   const entry = document.getElementById("entry");
//   if (entry) {
//     entry.innerHTML = ""; // Clear the container
//   }

//   // Get the updated routes
//   currentRoutes = navBarRoutes(isLogged.get());

//   // Check if the current path exists in the routes
//   const currentPath = window.location.pathname;
//   const isValidRoute = Object.prototype.hasOwnProperty.call(currentRoutes, currentPath);

//   // Create router only if we're on a valid route
//   if (isValidRoute) {
//     router = Router({
//       ...currentRoutes,
//     });

//     // Render the app
//     $("entry", { class: "min-h-screen w-[100vw] bg-black text-green-500 font-mono p-4" },
//       NavBar(currentRoutes),
//       router
//     );
//   } else {
//     // If current path is invalid, render only navbar with a message
//     $("entry", { class: "min-h-screen w-[100vw] bg-black text-green-500 font-mono p-4" },
//       NavBar(currentRoutes),
//       $("div", { class: "text-center mt-10" },
//         $("p", {}, "Redirecting to home page..."),
//         {
//           onmounted: () => {
//             // Redirect after a tiny delay
//             setTimeout(() => {
//               window.location.href = "/";
//             }, 10);
//           }
//         }
//       )
//     );
//   }
// }

// document.addEventListener("DOMContentLoaded", (event) => {
//   // Initial render
//   renderApp();

//   // Listen for login state changes
//   isLogged.subscribe(() => {
//     handleLoginStateChange();
//   });
// });
