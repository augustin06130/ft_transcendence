import { form, input, button } from "@framework/framework";

export function LoginForm(sumbitLabel: string) {
  return form(
    { id: "login-form" },
    input({
      type: "text",
      name: "username",
      placeholder: "Nom d'utilisateur",
      required: true,
    }),
    input({
      type: "password",
      name: "password",
      placeholder: "Mot de passe",
      required: true,
    }),
    button({ type: "submit" }, sumbitLabel)
  );
}

// LoginForm("S'inscrire")
