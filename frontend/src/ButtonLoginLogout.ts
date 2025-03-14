import * as fr from './framework';

export function ButtonLoginLogout(username:string) {
  return  fr.div(
    fr.span({className : "username",},
      `Bienvenue, ${username}`
    ),
    fr.div({id : "dropdownMenu", className : "dropdown-menu"},
      fr.a({href: "/logout.php", className: "dropdown-item"},
        "Logout"
      ),
    ),
    fr.button({id : "login-button",className :"login-btn",},
      "Login"
    )
  )
}
