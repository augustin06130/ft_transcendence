function terminalIconSVG(): SVGSVGElement {
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
    svg.setAttribute("class", "lucide lucide-terminal h-12 w-12 mb-4");

    // Create the <polyline> element
    const polyline = document.createElementNS(svgNamespace, "polyline");
    polyline.setAttribute("points", "4 17 10 11 4 5");

    // Create the <line> element
    const line = document.createElementNS(svgNamespace, "line");
    line.setAttribute("x1", "12");
    line.setAttribute("x2", "20");
    line.setAttribute("y1", "19");
    line.setAttribute("y2", "19");

    // Append the polyline and line to the SVG
    svg.appendChild(polyline);
    svg.appendChild(line);

    return svg;
}

export const TerminalIconSVG = terminalIconSVG();
