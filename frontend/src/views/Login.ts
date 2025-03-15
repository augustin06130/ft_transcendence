import { div, p, form, input, button, label } from "@framework/tags";
import TerminalBox, { footer } from "@components/TerminalBox";
import UseState from "@framework/UseState";

import { State } from "@framework/types";

function success(username:string) {
  // prettier-ignore
  return div({ class: "space-y-4 py-4 text-center" },
    p({ class: "text-xl text-green-400" }, "Authentication successful"),
    p({ class: "text-sm mt-2" }, `Welcome back, ${username}`),
    div({ class: "h-2 w-2 bg-green-500 rounded-full animate-pulse" }),
    p({ class: "text-sm" }, "Redirecting to system...")
  )
}

function LoginForm(handleSubmit:(e:Event)=>void, error:()=>string, loading:()=>boolean, username:State<string>, password:State<string>) {

  function inputL(
    id:string,
    name:string,
    labelName:string,
    type:string,

    value:()=>string,
    onInput:(e:Event)=>void,

    placeholder:string
  ) {
    return div({ class: "space-y-1" },
      label({ for: name, class: "text-sm text-green-500" }, `${labelName}:`),
      input({
        id: id,
        type: type,
        name: name,
        class: "w-full bg-black border border-green-500/30 p-2 text-green-500",
        placeholder: placeholder,
        value: value(),
        event:{
          input: onInput,
        }
      })
    )
  }

  // prettier-ignore
  return form({ 
    class: "space-y-4",
    event : {
      submit: handleSubmit
    }
  },
    inputL("username", "username", "USERNAME", "text", username.get, (e) => username.set((e.target as any)?.value), "username"),
    inputL("password", "password", "PASSWORD", "password", password.get, (e) => password.set((e.target as any)?.value), "********"),
    // error() && p({ class: "text-red-500 text-sm" }, error()),
    button({
        type: "submit",
        class: "w-full py-2 border border-green-500 text-green-500 hover:bg-green-500/20",
        disabled: loading(),
        // event: {
        //   submit: ()=>{console.log("lol")}
        // }
      },
      loading() ? "AUTHENTICATING..." : "LOGIN"
    )
  );
}


type Router = {
  push: (path: string) => void;
  back: () => void;
  pathname: string;
};

export function useRouter(): Router {
  return {
    push: (path: string) => {
      window.location.href = path;
    },
    back: () => {
      window.history.back();
    },
    pathname: window.location.pathname,
  };
}

export default function Login() {
  const router = useRouter();

  const username = UseState("");
  const password = UseState("");
  const error = UseState("");
  const loading = UseState(false);
  const loginSuccess = UseState(false);

  function handleSubmit(e:Event) {
    console.log("sun")
    // e.preventDefault();
    error.set("");
    if (!username || !password) {
      error.set("ERROR: All fields are required");
      return;
    }
    loading.set(true);
    setTimeout(() => {
      loading.set(false);
      loginSuccess.set(true);
      setTimeout(() => router.push("/"), 1500);
    }, 1000);
  }

  const formContent = loginSuccess.get()
    ? success(username.get()) 
    : LoginForm(handleSubmit, error.get, loading.get, username, password)

  console.log(username.get())


  // prettier-ignore
  return TerminalBox("terminal@user:~/auth",
    div({ class: "border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10" },
      div({ class: "text-center mb-6" },
        p({ class: "text-2xl font-bold tracking-wider" }, 
          "SYSTEM LOGIN"),
        p({ class: "text-green-400/70 text-sm mt-1" }, 
          "Enter credentials to access the system")
      ),
      formContent,
      div({ class: "mt-6 text-green-400/70 text-xs border-t border-green-500/30 pt-4" },
        p({}, `$ Last login: ${new Date().toLocaleString()}`),
        p({}, "$ System status: Online")
      )
    ),
    footer()
  );
}