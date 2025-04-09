import { div, table, td, tr } from '@framework/tags';
import { getCookie } from 'cookies';
import { FriendShip } from 'types';
import popOver from './PopOver';
import { withTerminalHostname } from './TerminalBox';

// total 460
// -rw-r--r--   1 ale-tell 2024_paris    216 Apr  4 11:43 Dockerfile
// drwxr-xr-x 306 ale-tell 2024_paris  12288 Apr  1 12:23 node_modules
// -rw-r--r--   1 ale-tell 2024_paris    607 Apr  4 11:43 package.json

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

    private makeRow(friendShip: FriendShip) {
        const className = 'px-[6px] py-[1px]';
        const date = new Date(friendShip.date);
		console.log(friendShip);
        return tr(
            { className: 'h-1' },
            td({ className }, this.randomChmod()),
            td({ className }, Math.floor(Math.random() * 500).toString()),
            td({ className }, friendShip.username),
            td({ className }, 'pong'),
            td({ className }, Math.floor(Math.random() * 1023).toString()),
            td({ className }, this.months[date.getMonth()]),
            td({ className }, date.getDay().toString()),
            td({ className }, `${date.getHours()}:${date.getMinutes()}`),
            td({ className }, friendShip.friend),
            td({ className }, friendShip.room)
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
                console.log(data);
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
