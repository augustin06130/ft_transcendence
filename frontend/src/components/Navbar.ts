import { nav, div, span, ul, li, a } from "@framework/framework";
import Link from "@framework/Link";

function navBarLink(link: string, label: string) {
  const linkClass = "hover:text-green-400 hover:underline";
  return Link({ className: linkClass }, link, `[${label.toUpperCase()}]`);
}

export function NavBar(routes: { [key: string]: { label: string } }) {
  const buttons = Object.entries(routes).map((route) =>
    navBarLink(route[0], route[1].label)
  );

  // prettier-ignore
  return nav({ className: "border-b border-green-500/30 pb-2 mb-8" },
    div({ className: "mx-auto flex items-center justify-between" },
      div({ className: "flex items-center gap-2" },
        span({ className: "text-xl font-bold tracking-wider" }, "ft_transcendence")
      ),
      ul({ className: "flex gap-6" }, 
        ...buttons.map((b) => li({}, b)))
    )
  );
}
