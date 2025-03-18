
export const isLogged = UseStateIsLogged(false,  () => {});


// UseStateIsLogged.ts
type Subscriber<T> = (value: T) => void;

export function UseStateIsLogged<T>(initialValue: T, onUpdate?: (value: T) => void) {
  let value = initialValue;
  const subscribers: Subscriber<T>[] = [];

  const get = () => value;

  const set = (newValue: T) => {
    if (value !== newValue) {
      value = newValue;
      if (onUpdate) onUpdate(value);
      subscribers.forEach((subscriber) => subscriber(value));
    }
  };

  const subscribe = (subscriber: Subscriber<T>) => {
    subscribers.push(subscriber);
    // Optionally, call the subscriber immediately with the current value
    subscriber(value);
    // Return an unsubscribe function
    return () => {
      const index = subscribers.indexOf(subscriber);
      if (index !== -1) subscribers.splice(index, 1);
    };
  };

  return { get, set, subscribe };
}
