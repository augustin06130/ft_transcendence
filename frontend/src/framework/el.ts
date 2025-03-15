import { Args, HTMLElementAttributes } from "@framework/types";

export function el(
  tagName: string,
  attributes: HTMLElementAttributes,
  ...children: Args[]
): HTMLElement {
  const parent = document.createElement(tagName);

  Object.keys(attributes).forEach((key) => {
    parent.setAttribute(key, attributes[key]);
  });

  children.forEach((element) => {
    if (typeof element === "string") {
      parent.innerHTML = element;
    } else {
      parent.appendChild(element as HTMLElement);
    }
  });

  return parent;
}
