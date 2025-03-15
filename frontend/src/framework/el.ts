import { Args, HTMLElementProperties, Events } from "@framework/types";

export function el<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  attributes: HTMLElementProperties<K>,
  ...children: Args[]
): HTMLElementTagNameMap[K] {
  const parent = document.createElement(tagName) as HTMLElementTagNameMap[K];

  for (const key in attributes) {
    if (key === "style" && attributes.style) {
      Object.assign(parent.style, attributes.style);
    } else if (key === "event" && attributes.event) {
      for (const event in attributes.event) {
        parent.addEventListener(event.slice(2).toLowerCase(), attributes.event[event] as EventListener);
      }
    } else if (attributes.hasOwnProperty(key)) {
      (parent as any)[key] = attributes[key as keyof typeof attributes];
    }
  }

  children.filter((child) => (child != null && child != undefined)).forEach((element) => {
    if (typeof element === "string") {
      parent.innerHTML = element;
    } else {
      parent.appendChild(element as HTMLElement);
    }
  });

  return parent;
}

var a = el("canvas",{})

// <K extends keyof HTMLElementTagNameMap>(name: K): HTMLElementTagNameMap[K]