import { div, p, pre, span } from "@framework/tags";
import TerminalBox from "@components/TerminalBox";
import CommandOutput from "@components/CommandOutput";

function fakeSystemInfo() {
  const label = "$ system.info";
  const message = `OS: Terminal_OS v1.0.2
  KERNEL: RetroKernel 4.8.15
  UPTIME: 3d 7h 14m 32s
  MEMORY: 640K (should be enough for anybody)
  STATUS: All systems operational`;
  return CommandOutput(label, message);
}

function animatedCaret() {
  // prettier-ignore
  return div({ className: "mt-4 flex items-center" },
    span({ className: "text-green-400 mr-2" }, "$"),
    div({ className: "h-5 w-2 bg-green-500 animate-pulse" })
  )
}

function footer() {
  // prettier-ignore
  return div({ className: "mt-8 text-green-400/70 text-sm text-center" },
    p({}, `© ${new Date().getFullYear()} TERM_OS • All systems nominal`)
  )
}

export default function Home() {
  // prettier-ignore
  const el = [
    div({ className: "space-y-4" },
      // p({ className: "text-green-400" },
      //   text,
      //   showCursor ? "█" : " "
      // ),
      fakeSystemInfo(),
      animatedCaret()
    ),
    footer(),
  ];
  return TerminalBox("terminal@user:~", ...el);
}
