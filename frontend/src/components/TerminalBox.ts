import { div, p } from "@framework/tags";
import { Args } from "@framework/types";
import { getCookie } from "cookies";

export function footer() {
	return div({ className: "mt-8 text-green-400/70 text-sm text-center" },
		p({}, `© ${new Date().getFullYear()} TERM_OS • All systems nominal`)
	);
}

export function withTerminalHostname(cmdName: string = "") {
	return `${getCookie('username') || 'guest'}@pong:~ ${cmdName}`;
}

export function BoxFooter() {
	return div({ className: "mt-6 text-green-400/70 text-xs border-t border-green-500/30 pt-4" },
		p({}, `$ System time: ${new Date().toLocaleString()}`),
		p({}, '$ System status: Online')
	)
}
export default function TerminalBox(label: string, ...children: Args[]) {
	return div({ className: "mx-auto" },
		div({ className: "border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10" },
			div({ className: "flex items-center gap-2 border-b border-green-500/30 pb-2 mb-4" },
				div({ className: "h-3 w-3 rounded-full bg-green-500" }),
				p({ className: "text-xs" }, withTerminalHostname(label))
			),
			...children,
		)
	);
}
