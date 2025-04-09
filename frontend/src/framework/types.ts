export type Events = {
  [key:string]: (e:Event)=>void
}

export type HTMLElementProperties<K extends keyof HTMLElementTagNameMap> =
Omit<Partial<HTMLElementTagNameMap[K]>, 'style'>
& {
  style?: Partial<CSSStyleDeclaration>;
  event?: Events;
};


export type Args = HTMLElement |SVGSVGElement| string | null | undefined;

export type Routes = {
  [key: string]: {
    view: (arg? : string) => HTMLElement;
    label: string;
    [key: string]: any;
  };
};

export type State<T> = {
  get:() => T,
  set:(value: T) => void,
}
