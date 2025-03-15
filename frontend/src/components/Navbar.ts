import { nav, div, span, ul, li, a } from "@framework/framework";
import Link from "@framework/Link";

function navBarLink(link: string, label: string) {
  const linkClass = "hover:text-green-400 hover:underline";
  return Link({ class: linkClass }, link, `[${label.toUpperCase()}]`);
}

export function NavBar(routes: { [key: string]: { label: string } }) {
  const buttons = Object.entries(routes).map((route) =>
    navBarLink(route[0], route[1].label)
  );

  // prettier-ignore
  return nav({ class: "border-b border-green-500/30 pb-2 mb-8" },
    div({ class: "mx-auto flex items-center justify-between" },
      div({ class: "flex items-center gap-2" },
        span({ class: "text-xl font-bold tracking-wider" }, "ft_transcendence")
      ),
      ul({ class: "flex gap-6" }, 
        ...buttons.map((b) => li({}, b)))
    )
  );
}
