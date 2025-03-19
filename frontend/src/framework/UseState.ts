// import { State } from "@framework/types";

// type Callback<T> = (newValue: T, oldValue: T) => void;

// export default function UseState<T>(
//   initialValue: T,
//   callback?: Callback<T> // Rendre le callback optionnel
// ): State<T> {
//   let value = initialValue;

//   const handler: ProxyHandler<{ value: T }> = {
//     set(target, property: keyof { value: T }, newValue: T) {
//       const oldValue = target[property];
//       if (oldValue !== newValue) {
//         target[property] = newValue;
//         if (callback) {
//           callback(newValue, oldValue); // Appeler le callback s'il est défini
//         }
//       }
//       return true;
//     },
//     get(target, property: keyof { value: T }) {
//       return target[property];
//     },
//   };

//   const proxy = new Proxy<{ value: T }>({ value }, handler);

//   return {
//     get() {
//       return proxy.value;
//     },
//     set(newValue: T) {
//       proxy.value = newValue;
//     },
//   };
// }

// framework/UseState.ts
type Callback<T> = (newValue: T, oldValue: T) => void;

let currentComponent: (() => void) | null = null; // Référence au composant actuel

export default function UseState<T>(initialValue: T, callback?: Callback<T>) {
  let value = initialValue;

  const subscribers = new Set<() => void>(); // Liste des composants à re-rendre

  const handler: ProxyHandler<{ value: T }> = {
    set(target, property: keyof { value: T }, newValue: T) {
      const oldValue = target[property];
      if (oldValue !== newValue) {
        target[property] = newValue;
        if (callback) callback(newValue, oldValue);
        subscribers.forEach((subscriber) => subscriber()); // Re-rendre les composants abonnés
      }
      return true;
    },
    get(target, property: keyof { value: T }) {
      if (currentComponent) {
        subscribers.add(currentComponent); // Abonner le composant actuel
      }
      return target[property];
    },
  };

  const proxy = new Proxy<{ value: T }>({ value }, handler);

  return {
    get() {
      return proxy.value;
    },
    set(newValue: T) {
      proxy.value = newValue;
    },
  };
}

// Fonction pour enregistrer le composant actuel
export function render(component: () => void) {
  currentComponent = component;
  const result = component(); // Appeler le composant pour le premier rendu
  currentComponent = null; // Réinitialiser après le rendu
  return result;
}
