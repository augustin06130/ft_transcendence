import { Args, HTMLElementProperties } from "@framework/types";

export function $(
  id: string,
  attributes: HTMLElementProperties,
  ...elements: Args[]
) {
  const entry = document.getElementById(id);
  if (entry) {
    Object.keys(attributes).forEach((key) => {
      entry.setAttribute(key, attributes[key]);
    });
    elements.forEach((child) => {
      entry.appendChild(child as HTMLElement);
    });
  }
}
