// LoginForm.ts

import { el } from './framework';

export function login_logout_btn(username:string) : HTMLElement {
  function cmp_span(username:string) : HTMLElement{
    let span =   el('span', `Bienvenue, ${username}`)
    span.className = "username"
    return span
  }
  
  function dropdown() : HTMLElement {
    let a = el("a", "Logout")
    a.setAttribute("href", "/logout.php")
    a.className = "dropdown-item"
  
    let d = el("div", a)
    d.id = "dropdownMenu"
    d.className = "dropdown-menu"
    return d
  }
  
  function b() {
    let e = el("button", "Login")
    e.id = "login-button"
    e.className ="login-btn"
    return e
  }

  return el('div',
    cmp_span(username),
    dropdown(),
    b()
  );
} 



export class LoginForm {
    private container: HTMLElement;
  
    constructor() {
      // Create a container div
      this.container = document.createElement('div');
      this.container.classList.add('form-container');
  
      this.render();
    }
  
    // Method to render the login form
    private render() {
      this.container.innerHTML = `
        <h2>Connexion</h2>
  
        <!-- Affichage des erreurs s'il y en a -->
        <div id="error-message" class="error" style="display:none;"></div>
  
        <!-- Formulaire de connexion -->
        <form id="login-form">
            <input type="text" name="username" placeholder="Nom d'utilisateur" required><br>
            <input type="password" name="password" placeholder="Mot de passe" required><br>
            <button type="submit">Se connecter</button>
        </form>
        <br>
        <a href="register.html">Créer un compte</a>
      `;
  
      // Attach the form submit handler
      const form = this.container.querySelector('#login-form') as HTMLFormElement;
      form.addEventListener('submit', this.handleSubmit.bind(this));
    }
  
    // Method to handle form submission
    private async handleSubmit(event: Event) {
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
  
    // Method to get the container element
    public getContainer(): HTMLElement {
      return this.container;
    }
  }
  