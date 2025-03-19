// import { div, p, form, input, label, span } from "@framework/tags";
// import TerminalBox, { footer } from "@components/TerminalBox";
// import UseState from "@framework/UseState";
// import UseRouter from "@framework/UseRouter";
// import { State } from "@framework/types";
// import { UserIconSVG } from "@Icon/User";
// import { LockIconSVG } from "@Icon/Lock";
// import { isLogged } from "@framework/auth";


// function success(username:string) {
//   // prettier-ignore
//   return div({ className: "space-y-4 py-4 text-center" },
//     p({ className: "text-xl text-green-400" }, "Authentication successful"),
//     p({ className: "text-sm mt-2" }, `Welcome back, ${username}`),
//     div({ className: "h-2 w-2 bg-green-500 rounded-full animate-pulse" }),
//     p({ className: "text-sm" }, "Redirecting to system...")
//   )
// }

// document.createElement('label').form
// function LoginForm(handleSubmit:(e:Event)=>void, error:()=>string, loading:()=>boolean, username:State<string>, password:State<string>) {

//   function inputL(
//     id:string,
//     name:string,
//     labelName:string,
//     type:string,

//     value:()=>string,
//     onInput:(e:Event)=>void,

//     placeholder:string,

//     icon: SVGSVGElement
//   ) {
//     return div({ className: "space-y-1" },
//       label({ htmlFor: name, className: "text-sm flex items-center gap-2" },
//         icon,
//         span({},`${labelName}:`)
//       ),
//       input({
//         id: id,
//         type: type,
//         name: name,
//         className: "w-full bg-black border border-green-500/30 p-2 text-green-500",
//         placeholder: placeholder,
//         value: value(),
//         event:{
//           input: onInput,
//         }
//       })
//     )
//   }

//   const err = error()
//   // prettier-ignore
//   return form({
//     className: "space-y-4",
//     event : {
//       submit: handleSubmit
//     }
//   },
//     inputL("username", "username", "USERNAME", "text", username.get, (e) => username.set((e.target as any)?.value), "username", UserIconSVG),
//     inputL("password", "password", "PASSWORD", "password", password.get, (e) => password.set((e.target as any)?.value), "********", LockIconSVG),
//     err ? p({ className: "text-red-500 text-sm" }, error()) : null,
//     input({
//       id: "submit",
//       type: "submit",
//       className: "w-full py-2 border border-green-500 text-green-500 hover:bg-green-500/20",
//     }),
//   );
// }

// export default function Login() {
//   const router = UseRouter();

//   // const username = UseState("");
//   // const password = UseState("");
//   // const error = UseState("");
//   // const loading = UseState(false);
//   // const loginSuccess = UseState(false);

//   const username = UseState("", () => {}); // Initialize with empty string and no callback
//   const password = UseState("", () => {}); // Initialize with empty string and no callback
//   const error = UseState("", () => {}); // Initialize with empty string and no callback
//   const loading = UseState(false, () => {}); // Initialize with false and no callback
//   const loginSuccess = UseState(false, () => {}); // Initialize with false and no callback

//   function handleSubmit(e:Event) {
//     e.preventDefault();
//     error.set("");
//     if (!username || !password) {
//       error.set("ERROR: All fields are required");
//       return;
//     }
//     loading.set(true);
//     fetch('/login', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         username: username.get(),
//         password: password.get(),
//       }),
//     })
//       .then((response) => {
//         if (!response.ok) {
//           // Si la réponse n'est pas OK, lancez une erreur
//           throw new Error('Échec de la connexion');
//         }
//         return response.json(); // Parsez la réponse JSON
//       })
//       .then((data) => {
//         if (data.success) {
//           loading.set(false); // Désactivez l'état de chargement
//           loginSuccess.set(true); // Définissez l'état de succès
//           isLogged.set(true);
//           setTimeout(() => {
//             window.dispatchEvent(new CustomEvent("url", { detail: { to: "/" } }));
//           }, 1000);
//           }  else {
//           throw new Error(data.error || 'Échec de la connexion');
//         }
//       })
//       .catch((err) => {
//         console.error('Erreur lors de la connexion :', err);
//         error.set(err.message); // Affichez un message d'erreur
//         loading.set(false); // Désactivez l'état de chargement
//       });
//     // setTimeout(() => {
//     //   loading.set(false);
//     //   loginSuccess.set(true);
//     //   setTimeout(() => router.push("/"), 1500);
//     // }, 1000);
//   }

//   const formContent = loginSuccess.get()
//     ? success(username.get())
//     : LoginForm(handleSubmit, error.get, loading.get, username, password)

//   console.log(username.get())


//   // prettier-ignore
//   return TerminalBox("terminal@user:~/auth",
//     div({ className: "mx-auto max-w-md border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10" },
//       div({ className: "text-center mb-6" },
//         p({ className: "text-2xl font-bold tracking-wider" },
//           "SYSTEM LOGIN"),
//         p({ className: "text-green-400/70 text-sm mt-1" },
//           "Enter credentials to access the system")
//       ),
//       formContent,
//       div({ className: "mt-6 text-green-400/70 text-xs border-t border-green-500/30 pt-4" },
//         p({}, `$ Last login: ${new Date().toLocaleString()}`),
//         p({}, "$ System status: Online")
//       )
//     ),
//     footer()
//   );
// }

import { div, p, form, input, label, span } from "@framework/tags";
import TerminalBox, { footer } from "@components/TerminalBox";
import UseState from "@framework/UseState";
import UseRouter from "@framework/UseRouter";
import { State } from "@framework/types";
import { UserIconSVG } from "@Icon/User";
import { LockIconSVG } from "@Icon/Lock";
import { isLogged } from "@framework/auth";

function success(username: string) {
  return div({ className: "space-y-4 py-4 text-center" },
    p({ className: "text-xl text-green-400" }, "Authentication successful"),
    p({ className: "text-sm mt-2" }, `Welcome back, ${username}`),
    div({ className: "h-2 w-2 bg-green-500 rounded-full animate-pulse" }),
    p({ className: "text-sm" }, "Redirecting to system...")
  );
}

function LoginForm(handleSubmit: (e: Event) => void, error: () => string, loading: () => boolean, username: State<string>, password: State<string>) {
  function inputL(
    id: string,
    name: string,
    labelName: string,
    type: string,
    value: () => string,
    onInput: (e: Event) => void,
    placeholder: string,
    icon: SVGSVGElement
  ) {
    return div({ className: "space-y-1" },
      label({ htmlFor: name, className: "text-sm flex items-center gap-2" },
        icon,
        span({}, `${labelName}:`)
      ),
      input({
        id: id,
        type: type,
        name: name,
        className: "w-full bg-black border border-green-500/30 p-2 text-green-500",
        placeholder: placeholder,
        value: value(),
        event: {
          input: onInput,
        }
      })
    );
  }

  const err = error();
  return form({
    className: "space-y-4",
    event: {
      submit: handleSubmit
    }
  },
    inputL("username", "username", "USERNAME", "text", username.get, (e) => username.set((e.target as any)?.value), "username", UserIconSVG),
    inputL("password", "password", "PASSWORD", "password", password.get, (e) => password.set((e.target as any)?.value), "********", LockIconSVG),
    err ? p({ className: "text-red-500 text-sm" }, error()) : null,
    input({
      id: "submit",
      type: "submit",
      className: "w-full py-2 border border-green-500 text-green-500 hover:bg-green-500/20",
    }),
  );
}

export default function Login() {
  const router = UseRouter();

  const username = UseState("", () => {});
  const password = UseState("", () => {});
  const error = UseState("", () => {});
  const loading = UseState(false, () => {});
  const loginSuccess = UseState(false, () => {});
  const isMounted = UseState(false, () => {}); // Pas de déstructuration ici

  // Gestion manuelle de l'effet (similaire à useEffect)
  const handleMount = () => {
    isMounted.set(true); // Définir isMounted à true au montage
    return () => {
      isMounted.set(false); // Définir isMounted à false au démontage
    };
  };

  // Appeler handleMount au montage du composant
  handleMount();

  function handleSubmit(e: Event) {
    e.preventDefault();
    error.set("");
    if (!username.get() || !password.get()) {
      error.set("ERROR: All fields are required");
      return;
    }
    loading.set(true);
    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.get(),
        password: password.get(),
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Échec de la connexion');
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          loading.set(false);
          loginSuccess.set(true);
          isLogged.set(true);
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("url", { detail: { to: "/" } }));
          }, 1000);
        } else {
          throw new Error(data.error || 'Échec de la connexion');
        }
      })
      .catch((err) => {
        console.error('Erreur lors de la connexion :', err);
        error.set(err.message);
        loading.set(false);
      });
  }

  const formContent = loginSuccess.get()
    ? success(username.get())
    : LoginForm(handleSubmit, error.get, loading.get, username, password);

  return TerminalBox("terminal@user:~/auth",
    div({ className: `mx-auto max-w-md border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10 transition-opacity duration-500 ${isMounted.get() ? "opacity-100" : "opacity-0"}` },
      div({ className: "text-center mb-6" },
        p({ className: "text-2xl font-bold tracking-wider" }, "SYSTEM LOGIN"),
        p({ className: "text-green-400/70 text-sm mt-1" }, "Enter credentials to access the system")
      ),
      formContent,
      div({ className: "mt-6 text-green-400/70 text-xs border-t border-green-500/30 pt-4" },
        p({}, `$ Last login: ${new Date().toLocaleString()}`),
        p({}, "$ System status: Online")
      )
    ),
    footer()
  );
}
