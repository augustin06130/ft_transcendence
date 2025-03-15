import { div, p, pre } from "@framework/tags";

export default function CommandOutput(cmdName: string, cmdOutput: string) {
  // prettier-ignore
  return div({ class: "mt-4" },
        p({ class: "text-green-300 opacity-80" }, cmdName),
        pre({ class: "mt-2 text-sm" }, cmdOutput)
      );
}
