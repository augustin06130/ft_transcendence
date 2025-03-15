import { Args, HTMLElementAttributes, Events } from "@framework/types";

export function el(
  tagName: string,
  attributes: HTMLElementAttributes,
  ...children: Args[]
): HTMLElement {
  const parent = document.createElement(tagName);

  Object.keys(attributes).forEach((key) => {
    if (key == "event") {
      console.log(parent, attributes[key])
      const event:Events = attributes[key]!;
      
      Object.entries(event).forEach(([name, callback]) => {
        parent.addEventListener(name, (e:Event) => {
          console.log(name, parent, e)
          callback(e)
        });
      })
    } else {
      parent.setAttribute(key, attributes[key]);
    }
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
