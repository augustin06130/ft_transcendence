export type Events = {
  [key:string]: (e:Event)=>void
}

export type HTMLElementAttributes = {
  event?:Events;
  [key: string]: any 
};
export type Args = HTMLElement | string;
export type Routes = {
  [key: string]: {
    view: () => HTMLElement;
    [key: string]: any;
  };
};
export type State<T> = {
  get:() => T,
  set:(value: T) => void,
}