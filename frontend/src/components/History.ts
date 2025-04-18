import { div, table, th, tr, td, button } from '@framework/tags';
import Loader from '@components/Loader';
import { MatchDB } from 'types';
import popOver from './PopOver';

export function History(name: string | null = null) {
	let page = 0;
	let maxPage = 1;
	const tableContainer = div({}, Loader());

	function getMaxPage() {
		const url = new URL('/api/matches/count', window.location.href);
		if (name) url.searchParams.set('username', name);
		fetch(url, {})
			.then(resp => resp.json())
			.then(json => {
				if (!json.success)
					throw json.message;
				updateFooter(json.count);
			}).catch(err => popOver.show(err));
	}

	function getPage(newPage: number, username: string | null = name) {
		if (newPage < 0 || newPage > maxPage - 1) return;
		page = newPage;
		const url = new URL('/api/matches', window.location.href);
		url.searchParams.set('page', newPage.toString());
		if (username) url.searchParams.set('username', username);
		fetch(url, {})
			.then(resp => resp.json())
			.then(json => {
				if (!json.success)
					throw json.message;
				getMaxPage();
				updateTable(json.data);
			}).catch(err => popOver.show(err));
	}

	function tableHeader() {
		const className = 'px-4 py-2';
		return tr(
			{ className: 'border-b border-green-500' },
			th({ className }, 'Date'),
			th({ className }, 'Player 1'),
			th({ className }, 'Player 2'),
			th({ className }, 'Score'),
			th({ className }, 'Rally'),
			th({ className }, 'Duration')
		);
	}

	function updateTable(data: MatchDB[]) {
		const className = 'px-4 py-2';
		tableContainer.replaceChildren(
			table(
				{ className: 'table-auto w-full' },
				tableHeader(),
				...data.map(row => {
					return tr(
						{ className: 'border-b border-green-500 hover:bg-green-900' },
						td(
							{ className },
							new Date(Math.max(...data.map(m => m.date))).toLocaleString()
						),
						td({ className }, row.player1),
						td({ className }, row.player2),
						td({ className }, `${row.score1}/${row.score2}`),
						td({ className }, row.rally.toString()),
						td({ className }, `${(row.duration / 1000).toFixed(1)}s`)
					);
				})
			)
		);
	}

	const pageDiv = div({});

	function updateFooter(newMaxPage: number) {
		maxPage = newMaxPage;
		pageDiv.innerText = `${page + 1}/${maxPage}`;
	}

	const tableFooter = div(
		{ className: 'flex justify-center items-center w-full mt-4 gap-2' },
		button(
			{
				className: 'text-lg px-2 hover:bg-green-900 rounded',
				event: {
					click: () => getPage(page - 1),
				},
			},
			' ◄ '
		),
		pageDiv,
		button(
			{
				className: 'text-lg px-2 hover:bg-green-900 rounded',
				event: {
					click: () => getPage(page + 1),
				},
			},
			' ► '
		)
	);
	// getMaxPage();
	getPage(page);

	let ret: any = div({}, tableContainer, tableFooter);
	ret.getPage = getPage;
	return ret;
}
