function sendIconSVG(): SVGSVGElement {
    const svgNamespace = "http://www.w3.org/2000/svg";

    // Create the SVG element
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
    svg.setAttribute("class", "lucide lucide-send h-5 w-5");

    // Create the first <path> element
    const path1 = document.createElementNS(svgNamespace, "path");
    path1.setAttribute("d", "m22 2-7 20-4-9-9-4Z");

    // Create the second <path> element
    const path2 = document.createElementNS(svgNamespace, "path");
    path2.setAttribute("d", "M22 2 11 13");

    // Append the paths to the SVG
    svg.appendChild(path1);
    svg.appendChild(path2);

    return svg;
}

export const SendIconSVG = sendIconSVG();
