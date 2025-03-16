function circleIconSVG(): SVGSVGElement {
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
    svg.setAttribute("class", "lucide lucide-circle h-2 w-2 fill-green-500 text-green-500");

    // Create the <circle> element
    const circle = document.createElementNS(svgNamespace, "circle");
    circle.setAttribute("cx", "12");
    circle.setAttribute("cy", "12");
    circle.setAttribute("r", "10");

    // Append the circle to the SVG
    svg.appendChild(circle);

    return svg;
}

export const CircleIconSVG = circleIconSVG();
