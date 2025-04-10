function twoFactorAuthIconSVG(): SVGSVGElement {
	const svgNamespace = "http://www.w3.org/2000/svg";
	// Create the SVG element
	const svg = document.createElementNS(svgNamespace, "svg");
	svg.setAttribute("xmlns", svgNamespace);
	svg.setAttribute("width", "56");
	svg.setAttribute("height", "48");
	svg.setAttribute("viewBox", "0 0 56 48");
	svg.setAttribute("fill", "none");
	svg.setAttribute("stroke", "currentColor");
	svg.setAttribute("stroke-width", "3");
	svg.setAttribute("stroke-linecap", "round");
	svg.setAttribute("stroke-linejoin", "round");
	svg.setAttribute("class", "lucide lucide-two-factor-auth h-10 w-10");

	// Create the lock body
	const lockBody = document.createElementNS(svgNamespace, "rect");
	lockBody.setAttribute("x", "12");
	lockBody.setAttribute("y", "22");
	lockBody.setAttribute("width", "18");
	lockBody.setAttribute("height", "16");
	lockBody.setAttribute("rx", "2");

	// Create the lock shackle
	const lockShackle = document.createElementNS(svgNamespace, "path");
	lockShackle.setAttribute("d", "M18 22v-6a3 3 0 0 1 6 0v6");

	// Create the keyhole
	const keyhole = document.createElementNS(svgNamespace, "circle");
	keyhole.setAttribute("cx", "21");
	keyhole.setAttribute("cy", "30");
	keyhole.setAttribute("r", "2");

	// Create the smartphone outline
	const phone = document.createElementNS(svgNamespace, "rect");
	phone.setAttribute("x", "36");
	phone.setAttribute("y", "14");
	phone.setAttribute("width", "12");
	phone.setAttribute("height", "24");
	phone.setAttribute("rx", "2");

	// Create the smartphone home button
	const homeButton = document.createElementNS(svgNamespace, "line");
	homeButton.setAttribute("x1", "42");
	homeButton.setAttribute("y1", "34");
	homeButton.setAttribute("x2", "42");
	homeButton.setAttribute("y2", "34");

	// Create the verification code dots (representing a code)
	const dot1 = document.createElementNS(svgNamespace, "circle");
	dot1.setAttribute("cx", "39");
	dot1.setAttribute("cy", "22");
	dot1.setAttribute("r", "1");

	const dot2 = document.createElementNS(svgNamespace, "circle");
	dot2.setAttribute("cx", "42");
	dot2.setAttribute("cy", "22");
	dot2.setAttribute("r", "1");

	const dot3 = document.createElementNS(svgNamespace, "circle");
	dot3.setAttribute("cx", "45");
	dot3.setAttribute("cy", "22");
	dot3.setAttribute("r", "1");

	// Create a check mark for activation
	const checkmark = document.createElementNS(svgNamespace, "path");
	checkmark.setAttribute("d", "M36 30l3 3 5-5");

	// Append all elements to the SVG
	svg.appendChild(lockBody);
	svg.appendChild(lockShackle);
	svg.appendChild(keyhole);
	svg.appendChild(phone);
	svg.appendChild(homeButton);
	svg.appendChild(dot1);
	svg.appendChild(dot2);
	svg.appendChild(dot3);
	svg.appendChild(checkmark);

	return svg;
}
export const TwoFactorAuthIconSVG = twoFactorAuthIconSVG();
