import TerminalBox, { withTerminalHostname } from "@components/TerminalBox";

export default function About() {
  const cmdName = withTerminalHostname("./about");
  return TerminalBox(cmdName);
}
