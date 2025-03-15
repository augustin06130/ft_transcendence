import { a } from "@framework/tags";
import { Args, HTMLElementAttributes } from "@framework/types";

export default function Link(
  attributes: HTMLElementAttributes,
  to: string,
  ...children: Args[]
) {
  const linkElement = a(
    {
      ...attributes,
      href: to,
    },
    ...children
  );

  linkElement.addEventListener("click", (event) => {
    event.preventDefault();
    const myEvent = new CustomEvent("url", {
      detail: {
        to: to,
      },
    });
    window.dispatchEvent(myEvent);
  });

  return linkElement;
}
