import { Args, HTMLElementProperties, Events } from "@framework/types";

import { mountEvent } from "./selector";

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
        parent.addEventListener(event, attributes.event[event] as EventListener);
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

  parent.addEventListener("onMounted", () => {
    Array.from(parent.children).forEach((e) => {
      e.dispatchEvent(mountEvent(e as HTMLElement));
    })
  })

  parent.addEventListener("onUnMount", () => {
    const container = parent.parentElement;
    if (container) {
      container.removeChild(parent)
    }
  })
  return parent;
}