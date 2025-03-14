type HTMLElementAttributes = { [key: string]: any };

type Args = HTMLElementAttributes | HTMLElement  | string
export function el(tagName: string, ...args: Args[]) : HTMLElement {
    const element = document.createElement(tagName);
  
    // Determine if the first argument is an attributes object or the first child
    let attributes: { [key: string]: any } = {};
    let children: Args[] = [];
  
    // Check if the first argument is an object (attributes)
    if (args.length > 0 && typeof args[0] === 'object' && !Array.isArray(args[0])) {
      attributes = args[0];
      children = args.slice(1);
    } else {
      children = args;
    }
  
    // Set attributes if provided
    Object.keys(attributes).forEach(key => {
      element.setAttribute(key, attributes[key]);
    });
  
    // Append children to the element
    children.forEach(child => {
      if (typeof child === 'string') {
        element.innerHTML = child;
      } else {
        element.appendChild(child as HTMLElement);
      }
    });
  
    return element;
};

export const div = (...children: Args[]) => el("div", ...children);
export const h1 = (...children: Args[]) => el("h1", ...children);
export const h2 = (...children: Args[]) => el("h2", ...children);
export const h3 = (...children: Args[]) => el("h3", ...children);
export const p = (...children: Args[]) => el("p", ...children);
export const a = (...children: Args[]) => el("a", ...children);
export const span = (...children: Args[]) => el("span", ...children);
export const select = (...children: Args[]) => el("select", ...children);
export const canvas = (...children: Args[]) => el("canvas", ...children);
export const button = (...children: Args[]) => el("button", ...children);
export const form = (...children: Args[]) => el("form", ...children);
export const input = (...children: Args[]) => el("input", ...children);
export const br = (...children: Args[]) => el("br", ...children);
export const nav = (...children: Args[]) => el("nav", ...children);
export const li = (...children: Args[]) => el("li", ...children);
export const ul = (...children: Args[]) => el("ul", ...children);
export const pre = (...children: Args[]) => el("pre", ...children);


export function $(id:string, ...elements:Args[]) {
    const entry = document.getElementById(id);

    let attributes: { [key: string]: any } = {};
    let children: Args[] = [];
  
    // Check if the first argument is an object (attributes)
    if (elements.length > 0 && typeof elements[0] === 'object' && !Array.isArray(elements[0])) {
      attributes = elements[0];
      children = elements.slice(1);
    } else {
      children = elements;
    }
  
    if (entry) {
      Object.keys(attributes).forEach(key => {
        entry.setAttribute(key, attributes[key]);
      });
      children.forEach(child => {
          entry.appendChild(child as HTMLElement);
      });
    }
}
type Routes = {
    [key: string]: () => HTMLElement;
  };

export function router(...routes:Routes[]) {
    let result = div();

    function syncHash() {
        let hashLocation = document.location.hash.split('#')[1];
        if (!hashLocation) {
            hashLocation = '/';
        }

        if (!(hashLocation in routes)) {
            // TODO(#2): make the route404 customizable in the router component
            const route404 = '/404';

            console.assert(route404 in routes);
            hashLocation = route404;
        }

        result.replaceChildren(routes[hashLocation]());

        return result;
    };

    syncHash();

    // TODO(#3): there is way to "destroy" an instance of the router to make it remove it's "hashchange" callback
    window.addEventListener("hashchange", syncHash);

    result.refresh = syncHash;

    return result;
}