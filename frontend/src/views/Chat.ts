import TerminalBox, { withTerminalHostname } from "@components/TerminalBox";

import ChatPage from "@components/Chat";

export default function ChatView() {
	const c = new ChatPage()
	return c.render();
}
