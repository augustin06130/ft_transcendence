import { div, span, a, button } from "@framework/framework";

export function ButtonLoginLogout(username: string) {
  return div(
    span({ className: "username" }, `Bienvenue, ${username}`),
    div(
      { id: "dropdownMenu", className: "dropdown-menu" },
      a({ href: "/logout.php", className: "dropdown-item" }, "Logout")
    ),
    button({ id: "login-button", className: "login-btn" }, "Login")
  );
}
