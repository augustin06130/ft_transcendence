import * as fr from './framework';
import { ButtonLoginLogout } from './ButtonLoginLogout';

function Link(label:string, link:string) {
  return fr.a({ href: link, class: "hover:text-green-400 hover:underline" }, 
    label)
}


export function NavBar() {
  // return fr.nav(
  //   fr.h1("ft_transcendence"),
  //   fr.a({href: "pong/pong.html", class: "btn"},
  //     "Pong"
  //   ),
  //   ButtonLoginLogout("USERNAME TEST"),
  // )


  const button_names = {
    "[HOME]" : "/",
    "[ABOUT]" : "/about",
    "[PROJECTS]" : "/projects",
    "[CONTACT]" : "/contact",
  }
  const buttons = Object.entries(button_names).map(([label, link]) => fr.li({}, Link(label, link)))

  return fr.nav({ class: "border-b border-green-500/30 pb-2 mb-8" },
    fr.div({ class: "mx-auto flex items-center justify-between" },
      fr.div({ class: "flex items-center gap-2" },
        fr.span({ class: "text-xl font-bold tracking-wider" }, "ft_transcendence")
      ),
      fr.ul({ class: "flex gap-6" },
        ...buttons
      )
    )
  )
}  