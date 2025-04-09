function removeFriendIconSVG(): SVGSVGElement {
    const svgNamespace = 'http://www.w3.org/2000/svg';
    // Create the SVG element
    const svg = document.createElementNS(svgNamespace, 'svg');
    svg.setAttribute('xmlns', svgNamespace);
    svg.setAttribute('width', '56');
    svg.setAttribute('height', '48');
    svg.setAttribute('viewBox', '0 0 56 48');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '3');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('class', 'lucide lucide-remove-friend h-10 w-10');

    // Create the circle for the person's head
    const circle = document.createElementNS(svgNamespace, 'circle');
    circle.setAttribute('cx', '20');
    circle.setAttribute('cy', '14');
    circle.setAttribute('r', '8');

    // Create the path for the person's body (complete)
    const bodyPath = document.createElementNS(svgNamespace, 'path');
    bodyPath.setAttribute('d', 'M6 42v-4a14 14 0 0 1 14-14 14 14 0 0 1 14 14v4');

    // Create the minus sign horizontal line (no vertical line for minus)
    const minusHorizontal = document.createElementNS(svgNamespace, 'line');
    minusHorizontal.setAttribute('x1', '34');
    minusHorizontal.setAttribute('y1', '20');
    minusHorizontal.setAttribute('x2', '50');
    minusHorizontal.setAttribute('y2', '20');

    // Append elements to the SVG
    svg.appendChild(circle);
    svg.appendChild(bodyPath);
    svg.appendChild(minusHorizontal);

    return svg;
}
export const RemoveFriendIconSVG = removeFriendIconSVG();
