import CommandOutput from '@components/CommandOutput';
import TerminalBox from '@components/TerminalBox';
import { div, span } from '@framework/tags';

function fakeSystemInfo() {
	const label = '$ system.info';
	const message = `OS: Terminal_OS v1.0.2
  KERNEL: RetroKernel 4.8.15
  UPTIME: 3d 7h 14m 32s
  MEMORY: 640K (should be enough for anybody)
  STATUS: All systems operational`;
	return CommandOutput(label, message);
}

export function animatedCaret() {
	return div({ className: "mt-4 flex items-center" },
		span({ className: "text-green-400 mr-2" }, "$"),
		div({ className: "h-5 w-2 bg-green-500 animate-pulse" })
	);
}

export default function Home() {
	const el = [
		div({ className: "space-y-4" },
			fakeSystemInfo(),
			animatedCaret()
		),
	];
	return TerminalBox('', ...el);
}
