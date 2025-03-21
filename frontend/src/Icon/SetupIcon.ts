function createSVGIcon(paths: { tag: string; attrs: Record<string, string> }[]): SVGSVGElement {
    const svgNamespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNamespace, "svg");
    svg.setAttribute("xmlns", svgNamespace);
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("class", "lucide h-3 w-3");

    paths.forEach(({ tag, attrs }) => {
        const element = document.createElementNS(svgNamespace, tag);
        Object.keys(attrs).forEach(attr => element.setAttribute(attr, attrs[attr]));
        svg.appendChild(element);
    });

    return svg;
}


function emailIconSVG() {
    return createSVGIcon([
        { tag: "path", attrs: { d: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" } },
        { tag: "polyline", attrs: { points: "22,6 12,13 2,6" } }
    ]);
}

function phoneIconSVG() {
    return createSVGIcon([
        { tag: "path", attrs: { d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.88 19.88 0 0 1-8.63-3.22 19.88 19.88 0 0 1-6-6A19.88 19.88 0 0 1 2.1 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8 10a16 16 0 0 0 6 6l1.36-1.36a2 2 0 0 1 2.11-.45 12.05 12.05 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" } }
    ]);
}

function editIconSVG() {
    return createSVGIcon([
        { tag: "path", attrs: { d: "M12 20h9" } },
        { tag: "path", attrs: { d: "M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" } }
    ]);
}

function saveIconSVG() {
    return createSVGIcon([
        { tag: "path", attrs: { d: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" } },
        { tag: "polyline", attrs: { points: "17 21 17 13 7 13 7 21" } },
        { tag: "polyline", attrs: { points: "7 3 7 8 15 8" } }
    ]);
}

function settingsIconSVG() {
    return createSVGIcon([
        { tag: "circle", attrs: { cx: "12", cy: "12", r: "3" } },
        { tag: "path", attrs: { d: "M19.4 15a2 2 0 0 1 .4 1.1 2 2 0 0 1-1 1.7l-2.2 1.3a2 2 0 0 1-2.2 0l-2.2-1.3a2 2 0 0 1-1-1.7 2 2 0 0 1 .4-1.1" } },
        { tag: "path", attrs: { d: "M4.6 9a2 2 0 0 1-.4-1.1 2 2 0 0 1 1-1.7l2.2-1.3a2 2 0 0 1 2.2 0l2.2 1.3a2 2 0 0 1 1 1.7 2 2 0 0 1-.4 1.1" } }
    ]);
}

export const EmailIconSVG = emailIconSVG();
export const PhoneIconSVG = phoneIconSVG();
export const EditIconSVG = editIconSVG();
export const SaveIconSVG = saveIconSVG();
export const SettingsIconSVG = settingsIconSVG();
