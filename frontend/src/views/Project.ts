import TerminalBox, { withTerminalHostname } from "@components/TerminalBox";
import CommandOutput from "@components/CommandOutput";

function fakeLs() {
  const label = "$ ls -la /projects";
  const message = `drwxr-xr-x  2 user terminal  4096 Mar 14 16:22 .
  drwxr-xr-x 21 user terminal  4096 Mar 14 16:22 ..
  -rw-r--r--  1 user terminal 12680 Mar 14 16:22 project_alpha.exe
  -rw-r--r--  1 user terminal  8452 Mar 14 16:22 neural_net.dat
  -rw-r--r--  1 user terminal  2048 Mar 14 16:22 quantum_algo.bin`;
  return CommandOutput(label, message);
}

export default function Project() {
  const cmdName = withTerminalHostname("./project");
  return TerminalBox(cmdName, fakeLs());
}
