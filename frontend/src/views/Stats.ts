import { div, p, ul, li } from '@framework/tags';
import TerminalBox, { footer } from '@components/TerminalBox';
import { PieChart, LineChart } from '@components/charts';

export default function StatsView(name: string = 'global') {

	fetch(`./getstats?name=${name}`, {
		method: 'GET',
	}).then((response) => {
		if (!response.ok) {
			throw new Error('stat fecting failed');
		}
		return response.json();
	}).then(data => {
		console.log('data', data);
	})

	const winLosePie = new PieChart(
		'win/lose',
		{ name: 'AI', value: 5 },
		{ name: 'Local', value: 2 },
		{ name: 'Remote', value: 15 }
	);
	const gameModePie = new PieChart('Game modes', { name: 'Win', value: 3 }, { name: 'Lose', value: 1 });
	const rallySuccesPie = new PieChart('Return rate', { name: 'Returned', value: 3 }, { name: 'Failed', value: 1 });
	const scoreLine = new LineChart('Score evolution', { x: 0, y: 0 });
	const rallyPerLine = new LineChart('Average rally per match', { x: 0, y: 0 });
	const durationLine = new LineChart('Match duration (s)', { x: 0, y: 0 });
	const travelLine = new LineChart('Travel distance per match (field)', { x: 0, y: 0 });
	const distanceScoreLine = new LineChart('Travel distance vs. Score (field/point)', { x: 0, y: 0 });
	const durationScoreLine = new LineChart('Match duration vs. Score (s/point)', { x: 0, y: 0 });

	return TerminalBox(
		'terminal@user:~/stats',
		div(
			{
				className: `mx-auto max-w-7xl bg-black/80 shadow-lg shadow-green-500/10'}`,
			},
			div(
				{ className: 'text-center mb-6' },
				p({ className: 'text-2xl font-bold tracking-wider' }, 'SYSTEM STATS'),
			),
			div({ className: 'p-4 ' },
				ul({ className: 'list-disc' },
					li({}, `Match played: ${Math.floor(Math.random() * 100)}`),
					li({}, `Win: ${Math.floor(Math.random() * 100)}`),
					li({}, `Loose: ${Math.floor(Math.random() * 100)}`),
					li({}, `Current win streak: ${Math.floor(Math.random() * 100)}`),
					li({}, `Longest win streak: ${Math.floor(Math.random() * 100)}`),
					li({}, `Average score: ${Math.floor(Math.random() * 10)}`),
					li({}, `Average winning score: ${Math.floor(Math.random() * 10)}`),
					li({}, `Average loosing score: ${Math.floor(Math.random() * 10)}`),
					li({}, `Tournament won: ${Math.floor(Math.random() * 100)}`),
					li({}, `Average paddle distance travel: ${Math.floor(Math.random() * 100)} field`),
					li({}, `Total paddle distance travel: ${Math.floor(Math.random() * 100)} field`),
					li({}, `Total play time: ${Math.floor(Math.random() * 100)} h`),
					li({}, `Average match duration: ${Math.floor(Math.random() * 100)} s`),
					li({}, `First match: ${Math.floor(Math.random() * 100)}`),
					li({}, `Latest match: ${Math.floor(Math.random() * 100)}`),
				),
			),
			div(
				{ className: 'grid grid-cols-3 gap-10' },
				winLosePie.render(),
				gameModePie.render(),
				rallySuccesPie.render(),
				scoreLine.render(),
				rallyPerLine.render(),
				durationLine.render(),
				travelLine.render(),
				distanceScoreLine.render(),
				durationScoreLine.render(),
			)
		),
		footer()
	);
}
