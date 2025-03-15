import { Args, HTMLElementAttributes } from "@framework/types";
import { el } from "@framework/el";

const tags = [
  "div",
  "h1",
  "h2",
  "h3",
  "p",
  "a",
  "span",
  "select",
  "canvas",
  "button",
  "form",
  "input",
  "br",
  "nav",
  "li",
  "ul",
  "pre",
  "label",
] as const;

export const elements = tags.reduce((acc, tag) => {
  acc[tag] = (attributes: HTMLElementAttributes, ...children: Args[]) =>
    el(tag, attributes, ...children);
  return acc;
}, {} as Record<(typeof tags)[number], (attributes: HTMLElementAttributes, ...children: Args[]) => ReturnType<typeof el>>);

// If you want them available globally
Object.assign(globalThis, elements);

export const {
  div,
  h1,
  h2,
  h3,
  p,
  a,
  span,
  select,
  canvas,
  button,
  form,
  input,
  br,
  nav,
  li,
  ul,
  pre,
  label,
} = elements;
