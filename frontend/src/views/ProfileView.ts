import { div, p } from '@framework/tags';
import TerminalBox, { footer } from '@components/TerminalBox';
import { Graphs, Stats } from './Stats';
import { MatchDB } from 'types';
import { getCookie } from 'cookies';
import Profile from '@components/Profile';

export default function ProfileView() {
	const username = getCookie('username');
	if (!username)
		return div({});

	const stats = new Stats(username);
	const graphs = new Graphs(username);

	fetch(`./api/stats?username=${username}`, {
	}).then(resp => {
		if (!resp.ok) {
			throw ('Error getching stats');
		}
		return resp.json();
	}).then((data: MatchDB[]) => {
		console.log(data);
		graphs.updateData(data);
		stats.updateData(data);
	});

	return TerminalBox("/profile",
		div({ className: "grid grid-cols-2 gap-5" },
			div({ className: "border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10" },
				p({ className: 'text-xl text-green-500 font-bold' }, 'USER PROFILE'),
				Profile(),
			),
			div({ className: "border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10" },
				p({ className: 'text-xl text-green-500 font-bold' }, 'USER STATS'),
				stats.render(),
			),
			div({ className: "col-span-2  border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10" },
				p({ className: 'text-xl text-green-500 font-bold' }, 'USER CHARTS'),
				graphs.render(),
			),
		),
		footer()
	);

}
