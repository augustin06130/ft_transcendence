import { div, table, td, tr } from '@framework/tags';
import { switchPage } from '@framework/Router';
import { getCookie } from '@framework/cookies';
import { FriendShip } from 'types';
import popOver from './PopOver';

export default class OnlineFriends {
	private friendsCount = 7;
	private friendsTable = table({ className: 'h-full' });
	private months = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec',
	];

	constructor() {
		this.makeRow = this.makeRow.bind(this);
	}

	private random3() {
		let ret = '';
		ret += Math.random() > 0.5 ? 'r' : '-';
		ret += Math.random() > 0.5 ? 'w' : '-';
		ret += Math.random() > 0.5 ? 'x' : '-';
		return ret;
	}

	private randomChmod() {
		let ret = '';
		ret += Math.random() > 0.5 ? 'd' : '-';
		ret += this.random3();
		ret += this.random3();
		ret += this.random3();
		return ret;
	}

	private makeRow(friendship: FriendShip) {
		const className = 'px-[6px] py-[1px] ';
		const date = new Date(friendship.date);
		return tr(
			{ className: 'h-1' },
			td({ className }, this.randomChmod()),
			td({ className }, Math.floor(Math.random() * 500).toString()),
			td({ className }, friendship.username),
			td({ className }, 'pong'),
			td({ className }, Math.floor(Math.random() * 1023).toString()),
			td({ className }, this.months[date.getMonth()]),
			td({ className }, date.getDay().toString()),
			td({ className }, `${date.getHours()}:${date.getMinutes()}`),
			td({
				className: className + 'hover:underline',
				onclick: () => switchPage('/profile', friendship.friend)
			}, friendship.friend),
			td({
				className: className + 'hover:underline',
				onclick: () => switchPage('/pong', friendship.room),
			}, friendship.room),
		);
	}

	private updateFriends() {
		const url = new URL('/api/friend/all', window.location.href);
		url.searchParams.set('username', getCookie('username') as string);
		fetch(url)
			.then(resp => {
				if (!resp.ok) throw 'Error getting friends list';
				return resp.json();
			})
			.then(data => {
				this.friendsTable.replaceChildren(...data.map(this.makeRow));
			})
			.catch(err => popOver.show(err));
	}

	public render() {
		this.updateFriends();
		return div(
			{ className: 'text-sm' },
			div({}, `total ${this.friendsCount}`),
			this.friendsTable
		);
	}
}
