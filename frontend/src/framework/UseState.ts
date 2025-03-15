import { State } from "@framework/types";

export default function UseState<T>(initialValue: T): State<T> {
  let state = initialValue;
  const getState = () => state;
  const setState = (value: T) => { state = value; };
  return {
    get: getState,
    set: setState
  };
}