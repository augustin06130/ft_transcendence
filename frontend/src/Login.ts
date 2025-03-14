import * as fr from './framework';

function login_form () {
  return (
    fr.form({ id: "login-form" },
      fr.input({ type: "text", name: "username", placeholder: "Nom d'utilisateur", required: true }),
      fr.input({ type: "password", name: "password", placeholder: "Mot de passe", required: true }),
      fr.button(
        "Se connecter"
      ) 
    )
  )
}

async function handleSubmit(event: Event) {
  event.preventDefault();

  // Get form data
  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  // Simulate form submission (you can replace with an actual API call)
  const errorMessage = this.container.querySelector('#error-message') as HTMLElement;

  // Example validation
  if (username === "" || password === "") {
    errorMessage.textContent = "Nom d'utilisateur ou mot de passe manquant!";
    errorMessage.style.display = "block";
    return;
  }

  // Simulating a failed login response
  if (username !== 'admin' || password !== 'password123') {
    errorMessage.textContent = "Nom d'utilisateur ou mot de passe incorrect!";
    errorMessage.style.display = "block";
  } else {
    // Handle successful login (e.g., redirect to another page)
    errorMessage.style.display = "none";
    window.location.href = '/dashboard.html';  // Redirect after successful login
  }
}
function render() {
  const l_form = login_form()
  // l_form.addEventListener('submit', this.handleSubmit.bind(this));
  return fr.div(
    fr.h2("Connexion"),
    fr.div({ id: "error-message", class: "error", style: "display:none;" }
      
    ),
    login_form,
    fr.br(),
    fr.a({ href: "register.html" }, "Créer un compte") 
  );
};

  