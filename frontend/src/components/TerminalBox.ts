import { div, p } from "@framework/tags";
import { Args } from "@framework/types";

export function footer() {
  // prettier-ignore
  return div({ className: "mt-8 text-green-400/70 text-sm text-center" },
    p({}, `© ${new Date().getFullYear()} TERM_OS • All systems nominal`)
  );
}

export function withTerminalHostname(cmdName: string = "") {
  return `terminal@user:~ ${cmdName}`;
}

export default function TerminalBox(label: string, ...children: Args[]) {
  // prettier-ignore
  return div({ className: "mx-auto" },
    div({ className: "border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10" },
      div({ className:"flex items-center gap-2 border-b border-green-500/30 pb-2 mb-4" },
        div({ className: "h-3 w-3 rounded-full bg-green-500" }),
        p({ className: "text-xs" }, label)
      ),
      ...children,
    )
  );
}
