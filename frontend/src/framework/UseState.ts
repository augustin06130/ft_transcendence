import { State } from "@framework/types";

type Callback<T> = (newValue: T, oldValue: T) => void;

export default function UseState<T>(initialValue: T, callback: Callback<T>): State<T> {
  let value = initialValue;

  const handler: ProxyHandler<{ value: T }> = {
    set(target, property: keyof { value: T }, newValue: T) {
      const oldValue = target[property];
      if (oldValue !== newValue) {
        target[property] = newValue;
        callback(newValue, oldValue);
      }
      return true;
    },
    get(target, property: keyof { value: T }) {
      return target[property];
    },
  };

  const proxy = new Proxy<{ value: T }>({ value }, handler);

  // Return an object that matches the `State<T>` type
  return {
    get() {
      return proxy.value;
    },
    set(newValue: T) {
      proxy.value = newValue;
    },
  };
}
