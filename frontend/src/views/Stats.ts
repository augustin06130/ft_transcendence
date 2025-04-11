import { PieChart, LineChart } from '@components/Charts';
import { MatchDB, MatchStatistics } from 'types';
import { div, ul, li } from '@framework/tags';

export class Graphs {
	name: string;
	winLosePie: PieChart;
	gameModePie: PieChart;
	returnRatePie: PieChart;
	scoreLine: LineChart;
	rallyLine: LineChart;
	durationLine: LineChart;
	travelLine: LineChart;
	distanceDurationLine: LineChart;
	durationScoreLine: LineChart;

	constructor(name: string) {
		this.name = name;
		this.winLosePie = new PieChart('Win/Lose');
		this.gameModePie = new PieChart('Game modes');
		this.returnRatePie = new PieChart('Return rate');
		this.scoreLine = new LineChart('Score evolution');
		this.rallyLine = new LineChart('Rally per match');
		this.durationLine = new LineChart('Match duration (s)');
		this.travelLine = new LineChart('Travel distance per match (field)');
		this.distanceDurationLine = new LineChart('Travel distance vs. Duration (field/s)', false);
		this.durationScoreLine = new LineChart('Match duration vs. Score (point/s)', false);

		this.fetchData(name);
	}

	public fetchData(name: string) {
		const url = new URL('/api/matches', window.location.href);
		url.searchParams.set('username', name);
		url.searchParams.set('page', '0');
		fetch(url, {})
			.then(resp => {
				if (!resp.ok) {
					throw 'Error getching stats';
				}
				return resp.json();
			})
			.then((data: MatchDB[]) => {
				this.updateData(data);
			})
			.catch(err => console.warn(err));
	}

	private setGameModePie(matches: MatchDB[]) {
		const result = [
			{ name: 'AI', value: 0 },
			{ name: 'Local', value: 0 },
			{ name: 'Remote', value: 0 },
		];
		matches.forEach(match => {
			if (match.player2 === 'Computer') {
				result[0].value++;
			} else if (match.player2 === 'Guest') {
				result[1].value++;
			} else {
				result[2].value++;
			}
		});
		this.gameModePie.setData(...result);
	}

	private setWinLosePie(matches: MatchDB[]) {
		const result = [
			{ name: 'Win', value: 0 },
			{ name: 'Lose', value: 0 },
		];
		if (this.name === 'global') {
			result[0].value = matches.length;
			result[1].value = matches.length;
		} else {
			matches.forEach(match => {
				if (match.winner === this.name) {
					result[0].value++;
				} else {
					result[1].value++;
				}
			});
		}
		this.winLosePie.setData(...result);
	}

	private setReturnRatePie(matches: MatchDB[]) {
		const result = [
			{ name: 'Success', value: 0 },
			{ name: 'Fail', value: 0 },
		];
		result[0].value = matches.reduce((acc, match) => acc + match.rally, 0);
		if (this.name === 'global') {
			result[1].value = matches.reduce((acc, match) => acc + match.score1 + match.score2, 0);
		} else {
			result[1].value = matches.reduce(
				(acc, match) => acc + (match.player1 === this.name ? match.score1 : match.score2),
				0
			);
		}
		this.returnRatePie.setData(...result);
	}

	private setTravelLine(matches: MatchDB[]) {
		if (this.name === 'global') {
			this.travelLine.setData(
				...matches.map((m, i) => {
					return { x: i, y: (m.travel1 + m.travel2) / 1000 };
				})
			);
		} else {
			this.travelLine.setData(
				...matches.map((m, i) => {
					return { x: i, y: (m.player1 === this.name ? m.travel1 : m.travel2) / 1000 };
				})
			);
		}
	}

	public updateData(data: MatchDB[]) {
		this.setWinLosePie(data);
		this.setGameModePie(data);
		this.setReturnRatePie(data);
		this.setTravelLine(data);
		this.distanceDurationLine.setData(
			...data.map(m => {
				return {
					x: (m.player2 === this.name ? m.travel2 : m.travel1) / 1000,
					y: m.duration / 1000,
				};
			})
		);
		this.durationScoreLine.setData(
			...data.map(m => {
				return { x: m.duration / 1000, y: m.player2 === this.name ? m.score2 : m.score1 };
			})
		);
		this.scoreLine.setData(
			...data.map((m, i) => {
				return { x: i, y: m.player2 === this.name ? m.score2 : m.score1 };
			})
		);
		this.rallyLine.setData(
			...data.map((m, i) => {
				return { x: i, y: m.rally };
			})
		);
		this.durationLine.setData(
			...data.map((m, i) => {
				return { x: i, y: m.duration / 1000 };
			})
		);
	}

	render() {
		return div(
			{ className: 'grid grid-cols-3 gap-10' },
			this.winLosePie.render(),
			this.gameModePie.render(),
			this.returnRatePie.render(),
			this.scoreLine.render(),
			this.rallyLine.render(),
			this.durationLine.render(),
			this.travelLine.render(),
			this.distanceDurationLine.render(),
			this.durationScoreLine.render()
		);
	}
}

export class Stats {
	private liMatchPlayer: HTMLLIElement = li({});
	private liWin: HTMLLIElement = li({});
	private liLose: HTMLLIElement = li({});
	private liAverageScore: HTMLLIElement = li({});
	private liAverageDistance: HTMLLIElement = li({});
	private liTotalDistance: HTMLLIElement = li({});
	private liTotalDuration: HTMLLIElement = li({});
	private liAverageDuration: HTMLLIElement = li({});
	private liFirstMatch: HTMLLIElement = li({});
	private liLastMath: HTMLLIElement = li({});
	private liTotalScore: HTMLLIElement = li({});
	private liAverageRally: HTMLLIElement = li({});
	private liTotalRally: HTMLLIElement = li({});
	private liFirstMatchWin: HTMLLIElement = li({});
	private liLastMathWin: HTMLLIElement = li({});
	private liAverageDurationWin: HTMLLIElement = li({});
	private liTotalDurationWin: HTMLLIElement = li({});
	private liAverageRallyWin: HTMLLIElement = li({});
	private liTotalRallyWin: HTMLLIElement = li({});
	private lis: HTMLElement[] = [];

	constructor(name: string) {
		this.fetchData(name);
		this.lis = [
			this.liMatchPlayer,
			this.liWin,
			this.liLose,
			this.liAverageScore,
			this.liTotalScore,
			this.liAverageDistance,
			this.liTotalDistance,
			this.liAverageRally,
			this.liTotalRally,
			this.liAverageRallyWin,
			this.liTotalRallyWin,
			this.liTotalDuration,
			this.liAverageDuration,
			this.liAverageDurationWin,
			this.liTotalDurationWin,
			this.liFirstMatch,
			this.liLastMath,
			this.liFirstMatchWin,
			this.liLastMathWin,
		];
	}

	public fetchData(name: string) {
		const url = new URL('/api/stats', window.location.href);
		url.searchParams.set('username', name);
		fetch(url, {})
			.then(resp => {
				if (!resp.ok) {
					throw 'Error fetching stats';
				}
				return resp.json();
			})
			.then((data: MatchStatistics) => {
				this.updateData(data);
			})
			.catch(err => console.warn(err));
	}

	public updateData(data: MatchStatistics) {
		const len = 35;
		Object.entries(data).forEach(([key, val]) => {
			if (val === null) {
				(data as any)[key] = 0;
			}
		});

		this.liMatchPlayer.innerText =
			`Match played:`.padEnd(len, ' ') + `${Intl.NumberFormat().format(data.countMatch)} match`;
		this.liWin.innerText = `Win:`.padEnd(len, ' ') + `${Intl.NumberFormat().format(data.countWin)} match`;
		this.liLose.innerText =
			`Loose:`.padEnd(len, ' ') + `${Intl.NumberFormat().format(data.countMatch - data.countWin)} match`;
		this.liAverageScore.innerText =
			`Average score:`.padEnd(len, ' ') + `${data.avgScore.toFixed(2)} point`;
		this.liTotalScore.innerText =
			`Total marked point:`.padEnd(len, ' ') + `${Intl.NumberFormat().format(data.sumScore)} point`;
		this.liAverageDistance.innerText =
			`Average paddle travel:`.padEnd(len, ' ') + `${Intl.NumberFormat().format(Math.floor(data.avgTravel))} field/match`;
		this.liTotalDistance.innerText =
			`Total paddle distance travel:`.padEnd(len, ' ') + `${Intl.NumberFormat().format(data.sumTravel)} field`;
		this.liAverageRally.innerText =
			`Average rally:`.padEnd(len, ' ') + `${data.avgRally.toFixed(2)} rally/match`;
		this.liTotalRally.innerText = `Total rally:`.padEnd(len, ' ') + `${Intl.NumberFormat().format(data.sumRally)} rally`;
		this.liAverageRallyWin.innerText =
			`Average rally per match (win):`.padEnd(len, ' ') +
			`${data.avgRallyWin.toFixed(2)} rally/match`;
		this.liTotalRallyWin.innerText =
			`Total rally (win):`.padEnd(len, ' ') + `${Intl.NumberFormat().format(data.sumRallyWin)} rally`;
		this.liAverageDuration.innerText =
			`Average match duration:`.padEnd(len, ' ') +
			`${(data.avgDuration / 1000).toFixed(1)} s`;
		this.liTotalDuration.innerText =
			`Total play time:`.padEnd(len, ' ') + durationFormat(data.sumDuration);
		this.liAverageDurationWin.innerText =
			`Average match duration (win):`.padEnd(len, ' ') +
			`${(data.avgDurationWin / 1000).toFixed(1)} s`;
		this.liTotalDurationWin.innerText =
			`Total match duration (win):`.padEnd(len, ' ') + durationFormat(data.sumDurationWin);
		this.liFirstMatch.innerText =
			`First match:`.padEnd(len, ' ') + `${new Date(data.firstMatch).toLocaleString()}`;
		this.liLastMath.innerText =
			`Latest match:`.padEnd(len, ' ') + `${new Date(data.lastestMatch).toLocaleString()}`;
		this.liFirstMatchWin.innerText =
			`First win:`.padEnd(len, ' ') + `${new Date(data.firstMatchWin).toLocaleString()}`;
		this.liLastMathWin.innerText =
			`Latest win:`.padEnd(len, ' ') + `${new Date(data.lastestMatchWin).toLocaleString()}`;
	}

	render() {
		return div({ className: 'p-4 ' }, ul({ className: 'list-disc' }, ...this.lis));
	}
}
const a: { div: number; unit: string }[] = [
	{ div: 1000, unit: 'ms' },
	{ div: 1000 * 60, unit: 's' },
	{ div: 1000 * 60 * 60, unit: 'min' },
	{ div: 1000 * 60 * 60 * 24, unit: 'h' },
]

function durationFormat(ms: number) {
	const i = a.findIndex(v => ms < v.div) || a.length - 1
	return `${(ms / (i > 0 ? a[i - 1].div : 1)).toFixed(1)} ${a[i].unit}`
}
