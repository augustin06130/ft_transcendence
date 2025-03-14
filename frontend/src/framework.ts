// framework.ts

type HTMLElementAttributes = { [key: string]: any };

type Args = HTMLElementAttributes | HTMLElement | string
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
