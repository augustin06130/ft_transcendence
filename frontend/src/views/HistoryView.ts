import TerminalBox from "@components/TerminalBox";
import { History } from "@components/History";

export default function HistoryView() {
	return TerminalBox('/history', History());
}

