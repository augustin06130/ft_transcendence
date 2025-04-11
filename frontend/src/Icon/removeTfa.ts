// function twoFactorAuthSVG(): SVGSVGElement {
// 	const svgNamespace = "http://www.w3.org/2000/svg";
// 	const svg = document.createElementNS(svgNamespace, "svg");
// 	svg.setAttribute("xmlns", svgNamespace);
// 	svg.setAttribute("width", "48");
// 	svg.setAttribute("height", "48");
// 	svg.setAttribute("viewBox", "0 0 48 48");
// 	svg.setAttribute("fill", "none");
// 	svg.setAttribute("stroke", "currentColor");
// 	svg.setAttribute("stroke-width", "4");
// 	svg.setAttribute("stroke-linecap", "round");
// 	svg.setAttribute("stroke-linejoin", "round");
// 	svg.setAttribute("class", "lucide lucide-shield h-8 w-8");
// 	const lockShackle = document.createElementNS(svgNamespace, "path");
// 	lockShackle.setAttribute("d", "M15 16V10a8 8 0 0 1 16 0v6");
//
// 	const shield = document.createElementNS(svgNamespace, "path");
// 	shield.setAttribute("d", "M36 16c1 0 2 .2 3 .8.8 .4 1.4 1.2 1.8 2 .4 .8 .8 1.8 1 2.8.2 1 .2 2.2 .2 3.4 0 7.6-2.8 11-18 17-15.2-6-18-9.4-18-17 0-4.6 1.8-9 4-9");
//
// 	const crossMark = document.createElementNS(svgNamespace, "path");
// 	crossMark.setAttribute("d", "M18 22l10 10M28 22l-10 10");
//
// 	svg.appendChild(lockShackle);
// 	svg.appendChild(shield);
// 	svg.appendChild(crossMark);
// 	return svg;
// };

function twoFactorAuthSVG(): SVGSVGElement {
    const svgNamespace = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNamespace, 'svg');
    svg.setAttribute('width', '48');
    svg.setAttribute('height', '48');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('viewBox', '0 0 444 512.36');
    svg.setAttribute('stroke-width', '12');
    svg.setAttribute('fill', 'none');

    const path = document.createElementNS(svgNamespace, 'path');
    path.setAttribute(
        'd',
        'M75.33 320.47h294.33c29.56-56.91 43.93-129.92 39.5-219.58-53.23 4.86-119.13-19.6-187.78-63.12-54.92 42.67-118.12 63.87-187.08 60.26-2.43 92.68 12.43 166.09 41.03 222.44zm328.53.58c14.79 2.87 26.06 16 26.06 31.53v127.66c0 17.59-14.52 32.12-32.12 32.12H46.18c-17.59 0-32.11-14.46-32.11-32.12V352.58c0-15.96 11.87-29.43 27.32-31.75C12.17 255.78-2.41 172.49.33 67.99 75.67 71.94 149.6 55.65 221.23 0 304.03 52.48 378.81 77.3 443 71.44c5.01 101.3-8.95 184.06-39.14 249.61zM105.2 397.93l-3.62-20.7c11.68-3.52 23.3-5.28 34.89-5.28 4.63 0 8.49.13 11.6.41 3.1.28 6.32.97 9.66 2.08 3.33 1.12 5.97 2.64 7.91 4.59 4.46 4.44 6.68 11.26 6.68 20.43s-2.6 15.93-7.79 20.29c-5.18 4.35-16.12 9.35-32.79 15v3.9h39.18v22.23H99.64v-17.37c0-5.19.97-10.14 2.91-14.87 1.21-2.69 4.13-5.93 8.76-9.73 2.5-2.13 5.86-4.17 10.07-6.11 4.22-1.95 8.2-3.78 11.96-5.49 3.75-1.71 6.78-3.13 9.1-4.24v-7.5c-4.17-.46-8.02-.7-11.54-.7-8.52 0-17.09 1.02-25.7 3.06zm140.7 33.06h-23.62v29.89h-27.8v-86.86h56.98l-3.48 22.25h-25.7v14.01h23.62v20.71zm38.64 29.89h-28.15l22.52-86.86h42.94l22.51 86.86h-28.15l-3.2-13.75h-25.27l-3.2 13.75zm12.13-60.17-3.93 24.32h15.13l-3.8-24.32h-7.4z'
    );

    const line1 = document.createElementNS(svgNamespace, 'line');
    line1.setAttribute('x1', '140');
    line1.setAttribute('y1', '125');
    line1.setAttribute('x2', '300');
    line1.setAttribute('y2', '285');

    const line2 = document.createElementNS(svgNamespace, 'line');
    line2.setAttribute('x1', '300');
    line2.setAttribute('y1', '125');
    line2.setAttribute('x2', '140');
    line2.setAttribute('y2', '285');

    svg.appendChild(path);
    svg.appendChild(line1);
    svg.appendChild(line2);

    return svg;
}

export const RemoveTwoFactorAuthSVG = twoFactorAuthSVG();
