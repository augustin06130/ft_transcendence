function lockIconSVG(): SVGSVGElement {
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
    svg.setAttribute("class", "lucide lucide-lock h-4 w-4");
  
    // Create the <rect> element for the lock body
    const rect = document.createElementNS(svgNamespace, "rect");
    rect.setAttribute("width", "18");
    rect.setAttribute("height", "11");
    rect.setAttribute("x", "3");
    rect.setAttribute("y", "11");
    rect.setAttribute("rx", "2");
    rect.setAttribute("ry", "2");
  
    // Create the <path> element for the lock shackle
    const path = document.createElementNS(svgNamespace, "path");
    path.setAttribute("d", "M7 11V7a5 5 0 0 1 10 0v4");
  
    // Append the rect and path to the SVG
    svg.appendChild(rect);
    svg.appendChild(path);
  
    return svg;
  };
  
export const LockIconSVG = lockIconSVG()
