import { div, p, pre } from "@framework/tags";

export default function CommandOutput(cmdName: string, cmdOutput: string) {
  // prettier-ignore
  return div({ className: "mt-4" },
        p({ className: "text-green-300 opacity-80" }, cmdName),
        pre({ className: "mt-2 text-sm" }, cmdOutput)
      );
}
