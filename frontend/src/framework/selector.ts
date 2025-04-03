import { Args, HTMLElementProperties } from "@framework/types";

export function mountEvent(element:HTMLElement) {
  return new CustomEvent("onMounted", {
    detail: {
        el: element,
        tag: element.tagName.toLowerCase(),
        id: element.id,
        classes: element.className,
    },
  })
}

export function $(
  id: string,
  attributes: HTMLElementProperties<'main'>,
  ...elements: Args[]
) {
  const entry = document.getElementById(id);
  if (entry) {
    Object.keys(attributes).forEach((key) => {
      entry.setAttribute(key, (attributes as any)[key]);
    });
    elements.forEach((child) => {
      entry.appendChild(child as HTMLElement);
    });
  }

  function handleNewElement(element: HTMLElement) {
    Array.from(element.children).forEach((e) => {
      e.dispatchEvent(mountEvent(e as HTMLElement));
    })
  }

  const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
              if (node instanceof HTMLElement) {
                  handleNewElement(node);
              }
          });
      });
  });

  observer.observe(entry!, { childList: true, subtree: true });
}
