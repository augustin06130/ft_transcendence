import { div, p, ul, li } from '@framework/tags';
import TerminalBox, { footer } from '@components/TerminalBox';
import { PieChart, LineChart } from '@components/charts';
import { Match } from 'types';

export default function StatsView(name: string = 'global') {

	fetch(`./getstats?name=${name}`).then(resp => {
		if (!resp.ok) {
			throw ('Error getching stats');
		}
		return resp.json();
	}).then((data: Match[]) => {
		console.log(data);
		setWinLosePie(data);
		setGameModePie(data);
		setReturnRatePie(data);
		scoreLine.setData(...data.map((m, i) => { return { x: i, y: (m.player2?.username === name ? m.score2 : m.score1) } }));
		rallyLine.setData(...data.map((m, i) => { return { x: i, y: m.rally } }));
		durationLine.setData(...data.map((m, i) => { return { x: i, y: m.duration / 1000 } }));
		setTravelLine(data);
		distanceDurationLine.setData(...data.map((m) => { return { x: (m.player2?.username === name ? m.travel2 : m.travel1) / 1000, y: m.duration / 1000 } }))
		durationScoreLine.setData(...data.map((m) => { return { x: m.duration / 1000, y: (m.player2?.username === name ? m.score2 : m.score1) } }))
		liMatchPlayer.innerText = `Match played: ${data.length}`;
		liWin.innerText = `Win: ${data.reduce((acc, m) => (m.winner?.username === name || name === 'global') ? acc + 1 : acc, 0)}`;
		liLose.innerText = `Loose: ${data.reduce((acc, m) => (m.winner?.username !== name || name === 'global') ? acc + 1 : acc, 0)}`;
		liCurrentStreak.innerText = `Current win streak: ${getCurrentWinStreak(data)}`;
		liLongestStreak.innerText = `Longest win streak: ${getLongestWinStreak(data)}`;
		liAverageSocre.innerText = `Average score: ${(data.reduce((acc, m) => (m.player2?.username === name) ? acc + m.score2 : acc + m.score1, 0) / data.length).toFixed(2)}`;
		liAverageSocreWin.innerText = `Average winning score: ${(data.filter(m => m.winner?.username === name).reduce((acc, m) => (m.player2?.username === name) ? acc + m.score2 : acc + m.score1, 0) / data.length).toFixed(2)}`;
		liAverageSocreLose.innerText = `Average loosing score: ${(data.filter(m => m.winner?.username !== name).reduce((acc, m) => (m.player2?.username === name) ? acc + m.score2 : acc + m.score1, 0) / data.length).toFixed(2)}`;
		liAverageDistance.innerText = `Average paddle distance travel: ${(data.reduce((acc, m) => (m.player2?.username === name) ? acc + m.travel2 : acc + m.travel1, 0) / 1000 / data.length).toFixed(2)} field`
		liTotalDistance.innerText = `Total paddle distance travel: ${Math.floor(data.reduce((acc, m) => ((m.player2?.username === name) ? acc + m.travel2 : acc + m.travel1), 0) / 1000)} field`;
		liAverageDuration.innerText = `Average match duration: ${(data.reduce((acc, m) => acc + m.duration / 1000, 0) / data.length).toFixed(2)} s`
		liTotalDuration.innerText = `Total play time: ${data.reduce((acc, m) => acc + m.duration / 1000 / 60, 0).toFixed(2)} min`;
		liFirstMatch.innerText = `First match: ${(new Date(Math.min(...data.map(m => m.date))).toLocaleString())}`;
		liLastMath.innerText = `Latest match: ${(new Date(Math.max(...data.map(m => m.date))).toLocaleString())}`;
	});

	const winLosePie = new PieChart('Win/Lose');
	const gameModePie = new PieChart('Game modes');
	const returnRatePie = new PieChart('Return rate');
	const scoreLine = new LineChart('Score evolution');
	const rallyLine = new LineChart('Rally per match');
	const durationLine = new LineChart('Match duration (s)');
	const travelLine = new LineChart('Travel distance per match (field)');
	const distanceDurationLine = new LineChart('Travel distance vs. Duration (field/s)', false);
	const durationScoreLine = new LineChart('Match duration vs. Score (point/s)', false);

	// li({}, `Tournament won: ${Math.floor(Math.random() * 100)}`);
	const liMatchPlayer = li({}), liWin = li({}), liLose = li({}), liCurrentStreak = li({}), liLongestStreak = li({});
	const liAverageSocre = li({}), liAverageSocreWin = li({}), liAverageSocreLose = li({}), liAverageDistance = li({});
	const liTotalDistance = li({}), liTotalDuration = li({}), liAverageDuration = li({}), liFirstMatch = li({}), liLastMath = li({});

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
					liMatchPlayer,
					liWin,
					liLose,
					liCurrentStreak,
					liLongestStreak,
					liAverageSocre,
					liAverageSocreWin,
					liAverageSocreLose,
					liAverageDistance,
					liTotalDistance,
					liAverageDuration,
					liTotalDuration,
					liFirstMatch,
					liLastMath,
				),
			),
			div(
				{ className: 'grid grid-cols-3 gap-10' },
				winLosePie.render(),
				gameModePie.render(),
				returnRatePie.render(),
				scoreLine.render(),
				rallyLine.render(),
				durationLine.render(),
				travelLine.render(),
				distanceDurationLine.render(),
				durationScoreLine.render(),
			)
		),
		footer()
	);

	function setGameModePie(matches: Match[]) {
		const result = [{ name: 'AI', value: 0 }, { name: 'Local', value: 0 }, { name: 'Remote', value: 0 }];
		matches.forEach(match => {
			if (match.player2?.username === 'computer') {
				result[0].value++;
			} else if (match.player2?.username === 'Guest') {
				result[1].value++;
			}
			else {
				result[2].value++;
			}
		});
		gameModePie.setData(...result);
	}

	function setWinLosePie(matches: Match[]) {
		const result = [{ name: 'Win', value: 0 }, { name: 'Lose', value: 0 }];
		if (name === 'global') {
			result[0].value = matches.length;
			result[1].value = matches.length;
		}
		else {
			matches.forEach(match => {
				if (match.winner?.username === name) {
					result[0].value++;
				} else {
					result[1].value++;
				}
			});
		}
		winLosePie.setData(...result);
	}

	function setReturnRatePie(matches: Match[]) {
		const result = [{ name: 'Success', value: 0 }, { name: 'Fail', value: 0 }];
		result[0].value = matches.reduce((acc, match) => acc + match.rally, 0);
		if (name === 'global') {
			result[1].value = matches.reduce((acc, match) => acc + match.score1 + match.score2, 0);
		}
		else {
			result[1].value = matches.reduce((acc, match) => acc + (match.player1?.username === name ? match.score1 : match.score2), 0);
		}
		returnRatePie.setData(...result);
	}

	function setTravelLine(matches: Match[]) {
		if (name === 'global') {
			travelLine.setData(...matches.map((m, i) => { return { x: i, y: (m.travel1 + m.travel2) / 1000 } }))
		}
		else {
			travelLine.setData(...matches.map((m, i) => { return { x: i, y: (m.player1?.username === name ? m.travel1 : m.travel2) / 1000 } }))
		}
	}

	function getCurrentWinStreak(data: Match[]) {
		let streak = 0;
		for (let m of data.reverse()) {
			if (m.winner?.username !== name) {
				break;
			}
			streak++;
		}
		return streak;
	}

	function getLongestWinStreak(data: Match[]) {
		let streak = 0;
		let max = 0;
		for (let m of data.reverse()) {
			if (m.winner?.username !== name) {
				max = Math.max(streak, max);
				streak = 0;
			}
			streak++;
		}
		return Math.max(streak, max);
	}
	function getAverageWinningScore(data: Match[]) {
	}

}
