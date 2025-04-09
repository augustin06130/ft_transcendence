function searchIconSVG(): SVGSVGElement {
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
    svg.setAttribute("class", "lucide lucide-search h-5 w-5");
    
    // Create the circle for the magnifying glass lens (smaller)
    const circle = document.createElementNS(svgNamespace, "circle");
    circle.setAttribute("cx", "10.5");
    circle.setAttribute("cy", "10.5");
    circle.setAttribute("r", "7");
    
    // Create the line for the magnifying glass handle (longer)
    const line = document.createElementNS(svgNamespace, "line");
    line.setAttribute("x1", "21.5");
    line.setAttribute("y1", "21.5");
    line.setAttribute("x2", "15.8");
    line.setAttribute("y2", "15.8");
    
    // Append the circle and line to the SVG
    svg.appendChild(circle);
    svg.appendChild(line);
    
    return svg;
}
export const SearchIconSVG = searchIconSVG();
