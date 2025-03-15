import { Args, HTMLElementAttributes } from "@framework/types";

export function $(
  id: string,
  attributes: HTMLElementAttributes,
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
