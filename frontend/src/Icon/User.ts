function userIconSVG (): SVGSVGElement {
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
    svg.setAttribute("class", "lucide lucide-user h-4 w-4");
  
    // Create the <path> element
    const path = document.createElementNS(svgNamespace, "path");
    path.setAttribute("d", "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2");
    
    // Create the <circle> element
    const circle = document.createElementNS(svgNamespace, "circle");
    circle.setAttribute("cx", "12");
    circle.setAttribute("cy", "7");
    circle.setAttribute("r", "4");
  
    // Append the path and circle to the SVG
    svg.appendChild(path);
    svg.appendChild(circle);
  
    return svg;
  };

export const UserIconSVG = userIconSVG();
