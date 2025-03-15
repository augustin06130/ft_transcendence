import { div, p } from "@framework/tags";
import { Args } from "@framework/types";

export function withTerminalHostname(cmdName: string = "") {
  return `terminal@user:~ ${cmdName}`;
}

export default function TerminalBox(label: string, ...children: Args[]) {
  // prettier-ignore
  return div({ class: "mx-auto" },
    div({ class: "border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10" },
      div({ class:"flex items-center gap-2 border-b border-green-500/30 pb-2 mb-4" },
        div({ class: "h-3 w-3 rounded-full bg-green-500" }),
        p({ class: "text-xs" }, label)
      ),
      ...children,
    )
  );
}
