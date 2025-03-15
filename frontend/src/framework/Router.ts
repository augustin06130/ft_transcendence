import { Routes } from "@framework/types";
import { div } from "@framework/tags";

export function Router(routes: Routes) {
  let result = div({});

  function updateUrl(event: Event) {
    const detail = event.detail;

    if (!(detail.to in routes)) {
      const route404 = "/404";
      console.assert(route404 in routes);
      detail.to = route404;
    }
    result.replaceChildren(routes[detail.to]());
    window.history.replaceState("page2", "", detail.to);
    return result;
  }
  window.addEventListener("url", updateUrl);

  // (result as any).refresh = syncHash;
  return result;
}
