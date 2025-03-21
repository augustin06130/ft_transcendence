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
    view: () => HTMLElement;
    label: string; // Ajoutez cette ligne
    [key: string]: any;
  };
};

export type State<T> = {
  get:() => T,
  set:(value: T) => void,
}
