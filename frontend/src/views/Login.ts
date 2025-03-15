import TerminalBox, { withTerminalHostname } from "@components/TerminalBox";
import { LoginForm } from "@components/LoginForm";
import { div, br, a } from "@framework/tags";

async function handleSubmit(event: Event) {
  event.preventDefault();

  // Get form data
  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  // Simulate form submission (you can replace with an actual API call)
  const errorMessage = this.container.querySelector(
    "#error-message"
  ) as HTMLElement;

  // Example validation
  if (username === "" || password === "") {
    errorMessage.textContent = "Nom d'utilisateur ou mot de passe manquant!";
    errorMessage.style.display = "block";
    return;
  }

  // Simulating a failed login response
  if (username !== "admin" || password !== "password123") {
    errorMessage.textContent = "Nom d'utilisateur ou mot de passe incorrect!";
    errorMessage.style.display = "block";
  } else {
    // Handle successful login (e.g., redirect to another page)
    errorMessage.style.display = "none";
    window.location.href = "/dashboard.html"; // Redirect after successful login
  }
}

export default function Login() {
  // l_form.addEventListener('submit', this.handleSubmit.bind(this));

  const cmdName = withTerminalHostname("./login");
  return TerminalBox(
    cmdName,
    div({ id: "error-message", class: "error", style: "display:none;" }),
    LoginForm("Se connecter"),
    br({}),
    a({ href: "register.html" }, "Créer un compte")
  );
}
