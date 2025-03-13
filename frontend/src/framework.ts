// framework.ts

export function el(name:string , ...children: (HTMLElement|string)[]) : HTMLElement {
    const result = document.createElement(name);
    for (const child of children) {
        if (typeof(child) === 'string') {
            result.appendChild(document.createTextNode(child));
        } else {
            result.appendChild(child);
        }
    }
    return result;
}


