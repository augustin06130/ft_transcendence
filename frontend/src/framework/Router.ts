import { Routes } from "@framework/types";
import { div } from "@framework/tags";

export function Router(routes: Routes) {
  let result = div({});

  function updateUrl(event: Event) {
    const detail = (event as any).detail;

    if (!(detail.to in routes)) {
      const route404 = "/404";
      console.assert(route404 in routes);
      detail.to = route404;
    }

    result.replaceChildren(routes[detail.to].view());
    window.history.pushState("page2", "", detail.to);
    return result;
  }

  window.addEventListener("url", updateUrl);
  result.replaceChildren(routes[window.location.pathname].view());

  window.addEventListener("popstate", (event) => {
    const path = window.location.pathname;
    result.replaceChildren(routes[path].view());
  });
  // (result as any).refresh = syncHash;
  return result;
}

