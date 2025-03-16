import { State } from "@framework/types";

const EVENT_NAME = "stateChange";

export default function UseState<T>(initialValue: T): State<T> {
  let state = initialValue;
  const getState = () => state;
  const setState = (value: T) => { 
    state = value;
    const myEvent = new CustomEvent(EVENT_NAME, {});
    window.dispatchEvent(myEvent);
  };
  return {
    get: getState,
    set: setState
  };
}

import { div } from "./tags";

export function Update(el: HTMLElement) {
  const root = div({})

  const render = (state: any) => {
    console.log("state changed")
    root.innerHTML = '';
    root.appendChild(el);
  };

  root.addEventListener(EVENT_NAME, (e:Event) => {
    render(null);
  })
  render(null);
  return root
}