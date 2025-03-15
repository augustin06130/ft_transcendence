import { nav, div, span, ul, li, a } from "@framework/framework";
import Link from "@framework/Link";
// function Link(label: string, link: string) {
//   return a(
//     { href: link, class: "hover:text-green-400 hover:underline" },
//     label
//   );
// }

const linkClass = "hover:text-green-400 hover:underline";

export function NavBar() {
  const button_names = {
    "[HOME]": "/",
    "[ABOUT]": "/about",
    "[PROJECTS]": "/projects",
    "[CONTACT]": "/contact",
    "[LOGIN]": "/login",
    "[yes]": "/yes",
    "[no]": "/no",
  };
  const buttons = Object.entries(button_names).map(([label, link]) =>
    li({}, Link({ class: linkClass }, link, label))
  );

  return nav(
    { class: "border-b border-green-500/30 pb-2 mb-8" },
    div(
      { class: "mx-auto flex items-center justify-between" },
      div(
        { class: "flex items-center gap-2" },
        span({ class: "text-xl font-bold tracking-wider" }, "ft_transcendence")
      ),
      ul({ class: "flex gap-6" }, ...buttons)
    )
  );
}
