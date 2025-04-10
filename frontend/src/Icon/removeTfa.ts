function twoFactorAuthSVG(): SVGSVGElement {
	const svgNamespace = "http://www.w3.org/2000/svg";

	const svg = document.createElementNS(svgNamespace, "svg");
	svg.setAttribute("xmlns", svgNamespace);
	svg.setAttribute("width", "48");
	svg.setAttribute("height", "48");
	svg.setAttribute("viewBox", "0 0 48 48");
	svg.setAttribute("fill", "none");
	svg.setAttribute("stroke", "currentColor");
	svg.setAttribute("stroke-width", "4");
	svg.setAttribute("stroke-linecap", "round");
	svg.setAttribute("stroke-linejoin", "round");
	svg.setAttribute("class", "lucide lucide-shield h-8 w-8");

	const lockShackle = document.createElementNS(svgNamespace, "path");
	lockShackle.setAttribute("d", "M15 16V10a8 8 0 0 1 16 0v6");
	
	const shield = document.createElementNS(svgNamespace, "path");
	shield.setAttribute("d", "M36 16c1 0 2 .2 3 .8.8 .4 1.4 1.2 1.8 2 .4 .8 .8 1.8 1 2.8.2 1 .2 2.2 .2 3.4 0 7.6-2.8 11-18 17-15.2-6-18-9.4-18-17 0-4.6 1.8-9 4-9");
	
	const crossMark = document.createElementNS(svgNamespace, "path");
	crossMark.setAttribute("d", "M19 22l10 10M29 22l-10 10");
	
	svg.appendChild(lockShackle);
	svg.appendChild(shield);
	svg.appendChild(crossMark);
	return svg;
};
export const RemoveTwoFactorAuthSVG = twoFactorAuthSVG()
