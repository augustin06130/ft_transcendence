import { div } from '@framework/tags';
import TerminalBox from '@components/TerminalBox';
import CommandOutput from '@components/CommandOutput';
import { animatedCaret } from './Home';


export default function _404View() {
	return TerminalBox(
		'terminal@user:~',
		div(
			{ className: 'space-y-4' },
			CommandOutput(
				`$ cd ${window.location.pathname}`,
				`cd: no such file or directory: ${window.location.pathname}`
			),
			animatedCaret()
		)
	);
}
