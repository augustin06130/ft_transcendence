import TerminalBox, { withTerminalHostname } from "@components/TerminalBox";

export default function Pong() {
  const cmdName = withTerminalHostname("./pong");
  return TerminalBox(cmdName);
}
