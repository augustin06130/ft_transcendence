function addFriendIconSVG(): SVGSVGElement {
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
    svg.setAttribute('class', 'lucide lucide-add-friend h-10 w-10');

    // Create the circle for the person's head
    const circle = document.createElementNS(svgNamespace, 'circle');
    circle.setAttribute('cx', '20');
    circle.setAttribute('cy', '14');
    circle.setAttribute('r', '8');

    // Create the path for the person's body (complete)
    const bodyPath = document.createElementNS(svgNamespace, 'path');
    bodyPath.setAttribute('d', 'M6 42v-4a14 14 0 0 1 14-14 14 14 0 0 1 14 14v4');

    // Create the plus sign horizontal line (moved up)
    const plusHorizontal = document.createElementNS(svgNamespace, 'line');
    plusHorizontal.setAttribute('x1', '34');
    plusHorizontal.setAttribute('y1', '20');
    plusHorizontal.setAttribute('x2', '50');
    plusHorizontal.setAttribute('y2', '20');

    // Create the plus sign vertical line (moved up)
    const plusVertical = document.createElementNS(svgNamespace, 'line');
    plusVertical.setAttribute('x1', '42');
    plusVertical.setAttribute('y1', '12');
    plusVertical.setAttribute('x2', '42');
    plusVertical.setAttribute('y2', '28');

    // Append elements to the SVG
    svg.appendChild(circle);
    svg.appendChild(bodyPath);
    svg.appendChild(plusHorizontal);
    svg.appendChild(plusVertical);

    return svg;
}
export const AddFriendIconSVG = addFriendIconSVG();
