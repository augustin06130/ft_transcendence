import { div, ul, li } from '@framework/tags';
import { PieChart, LineChart } from '@components/Charts';
import { MatchDB } from 'types';

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
	}

	private setGameModePie(matches: MatchDB[]) {
		const result = [{ name: 'AI', value: 0 }, { name: 'Local', value: 0 }, { name: 'Remote', value: 0 }];
		matches.forEach(match => {
			if (match.player2 === 'Computer') {
				result[0].value++;
			} else if (match.player2 === 'Guest') {
				result[1].value++;
			}
			else {
				result[2].value++;
			}
		});
		this.gameModePie.setData(...result);
	}

	private setWinLosePie(matches: MatchDB[]) {
		const result = [{ name: 'Win', value: 0 }, { name: 'Lose', value: 0 }];
		if (this.name === 'global') {
			result[0].value = matches.length;
			result[1].value = matches.length;
		}
		else {
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
		const result = [{ name: 'Success', value: 0 }, { name: 'Fail', value: 0 }];
		result[0].value = matches.reduce((acc, match) => acc + match.rally, 0);
		if (this.name === 'global') {
			result[1].value = matches.reduce((acc, match) => acc + match.score1 + match.score2, 0);
		}
		else {
			result[1].value = matches.reduce((acc, match) => acc + (match.player1 === this.name ? match.score1 : match.score2), 0);
		}
		this.returnRatePie.setData(...result);
	}

	private setTravelLine(matches: MatchDB[]) {
		if (this.name === 'global') {
			this.travelLine.setData(...matches.map((m, i) => { return { x: i, y: (m.travel1 + m.travel2) / 1000 } }))
		}
		else {
			this.travelLine.setData(...matches.map((m, i) => { return { x: i, y: (m.player1 === this.name ? m.travel1 : m.travel2) / 1000 } }))
		}
	}

	public updateData(data: MatchDB[]) {
		this.setWinLosePie(data);
		this.setGameModePie(data);
		this.setReturnRatePie(data);
		this.setTravelLine(data);
		this.distanceDurationLine.setData(...data.map((m) => { return { x: (m.player2 === this.name ? m.travel2 : m.travel1) / 1000, y: m.duration / 1000 } }))
		this.durationScoreLine.setData(...data.map((m) => { return { x: m.duration / 1000, y: (m.player2 === this.name ? m.score2 : m.score1) } }))
		this.scoreLine.setData(...data.map((m, i) => { return { x: i, y: (m.player2 === this.name ? m.score2 : m.score1) } }));
		this.rallyLine.setData(...data.map((m, i) => { return { x: i, y: m.rally } }));
		this.durationLine.setData(...data.map((m, i) => { return { x: i, y: m.duration / 1000 } }));
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
			this.durationScoreLine.render(),
		);
	}

}

export class Stats {
	private name: string;
	private liMatchPlayer: HTMLLIElement = li({});
	private liWin: HTMLLIElement = li({});
	private liLose: HTMLLIElement = li({});
	private liCurrentStreak: HTMLLIElement = li({});
	private liLongestStreak: HTMLLIElement = li({});
	private liAverageSocre: HTMLLIElement = li({});
	private liAverageSocreWin: HTMLLIElement = li({});
	private liAverageSocreLose: HTMLLIElement = li({});
	private liAverageDistance: HTMLLIElement = li({});
	private liTotalDistance: HTMLLIElement = li({});
	private liTotalDuration: HTMLLIElement = li({});
	private liAverageDuration: HTMLLIElement = li({});
	private liFirstMatch: HTMLLIElement = li({});
	private liLastMath: HTMLLIElement = li({});

	constructor(name: string) {
		this.name = name;
	}

	private getCurrentWinStreak(data: MatchDB[]) {
		let streak = 0;
		for (let m of data.reverse()) {
			if (m.winner !== this.name) {
				break;
			}
			streak++;
		}
		return streak;
	}

	private getLongestWinStreak(data: MatchDB[]) {
		let streak = 0;
		let max = 0;
		for (let m of data.reverse()) {
			if (m.winner !== this.name) {
				max = Math.max(streak, max);
				streak = 0;
			}
			streak++;
		}
		return Math.max(streak, max);
	}

	public updateData(data: MatchDB[]) {
		this.liMatchPlayer.innerText = `Match played: ${data.length}`;
		this.liWin.innerText = `Win: ${data.reduce((acc, m) => (m.winner === this.name || this.name === 'global') ? acc + 1 : acc, 0)}`;
		this.liLose.innerText = `Loose: ${data.reduce((acc, m) => (m.winner !== this.name || this.name === 'global') ? acc + 1 : acc, 0)}`;
		this.liCurrentStreak.innerText = `Current win streak: ${this.getCurrentWinStreak(data)}`;
		this.liLongestStreak.innerText = `Longest win streak: ${this.getLongestWinStreak(data)}`;
		this.liAverageSocre.innerText = `Average score: ${(data.reduce((acc, m) => (m.player2 === this.name) ? acc + m.score2 : acc + m.score1, 0) / data.length).toFixed(2)}`;
		this.liAverageSocreWin.innerText = `Average winning score: ${(data.filter(m => m.winner === this.name).reduce((acc, m) => (m.player2 === this.name) ? acc + m.score2 : acc + m.score1, 0) / data.length).toFixed(2)}`;
		this.liAverageSocreLose.innerText = `Average loosing score: ${(data.filter(m => m.winner !== this.name).reduce((acc, m) => (m.player2 === this.name) ? acc + m.score2 : acc + m.score1, 0) / data.length).toFixed(2)}`;
		this.liAverageDistance.innerText = `Average paddle distance travel: ${(data.reduce((acc, m) => (m.player2 === this.name) ? acc + m.travel2 : acc + m.travel1, 0) / 1000 / data.length).toFixed(2)} field`
		this.liTotalDistance.innerText = `Total paddle distance travel: ${Math.floor(data.reduce((acc, m) => ((m.player2 === this.name) ? acc + m.travel2 : acc + m.travel1), 0) / 1000)} field`;
		this.liAverageDuration.innerText = `Average match duration: ${(data.reduce((acc, m) => acc + m.duration / 1000, 0) / data.length).toFixed(2)} s`
		this.liTotalDuration.innerText = `Total play time: ${data.reduce((acc, m) => acc + m.duration / 1000 / 60, 0).toFixed(2)} min`;
		this.liFirstMatch.innerText = `First match: ${(new Date(Math.min(...data.map(m => m.date))).toLocaleString())}`;
		this.liLastMath.innerText = `Latest match: ${(new Date(Math.max(...data.map(m => m.date))).toLocaleString())}`;
	}

	render() {
		return div({ className: 'p-4 ' },
			ul({ className: 'list-disc' },
				this.liMatchPlayer,
				this.liWin,
				this.liLose,
				this.liCurrentStreak,
				this.liLongestStreak,
				this.liAverageSocre,
				this.liAverageSocreWin,
				this.liAverageSocreLose,
				this.liAverageDistance,
				this.liTotalDistance,
				this.liAverageDuration,
				this.liTotalDuration,
				this.liFirstMatch,
				this.liLastMath,
			)
		);
	}
}
