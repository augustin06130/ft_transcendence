export type HTMLElementAttributes = { [key: string]: any };
export type Args = HTMLElement | string;
export type Routes = {
  [key: string]: () => HTMLElement;
};
