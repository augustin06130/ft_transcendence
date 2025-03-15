import TerminalBox, { withTerminalHostname } from "@components/TerminalBox";

export default function Contact() {
  const cmdName = withTerminalHostname("./contact");
  return TerminalBox(cmdName);
}
