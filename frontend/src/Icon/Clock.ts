function clockIconSVG(): SVGSVGElement {
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
    svg.setAttribute("class", "lucide lucide-clock h-3 w-3");

    // Create the <circle> element
    const circle = document.createElementNS(svgNamespace, "circle");
    circle.setAttribute("cx", "12");
    circle.setAttribute("cy", "12");
    circle.setAttribute("r", "10");

    // Create the <polyline> element
    const polyline = document.createElementNS(svgNamespace, "polyline");
    polyline.setAttribute("points", "12 6 12 12 16 14");

    // Append the circle and polyline to the SVG
    svg.appendChild(circle);
    svg.appendChild(polyline);

    return svg;
}

export const ClockIconSVG = clockIconSVG();
