import { div, p } from '@framework/tags';
import TerminalBox from '@components/TerminalBox';
import { Graphs, Stats } from './Stats';
import { getCookie } from 'cookies';
import Profile from '@components/Profile';
import { History } from '@components/History';

export default function ProfileView(username: string | undefined = undefined) {
    if (!username) username = getCookie('username');
    if (!username) return div({});

    let stats = new Stats(username);
    let graphs = new Graphs(username);
    let history = History(username);

    return TerminalBox(
        '/profile',
        div(
            { className: 'grid grid-cols-2 gap-5' },
            div(
                {
                    className:
                        'border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10',
                },
                Profile(username)
            ),
            div(
                {
                    className:
                        'border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10',
                },
                p({ className: 'text-xl text-green-500 font-bold' }, 'USER STATS'),
                stats.render()
            ),
            div(
                {
                    className:
                        'col-span-2  border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10',
                },
                p({ className: 'text-xl text-green-500 font-bold' }, 'USER HISTORY'),
                history
            ),
            div(
                {
                    className:
                        'col-span-2  border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10',
                },
                p(
                    { className: 'text-xl text-green-500 font-bold' },
                    'USER CHARTS  (over last 25 matches)'
                ),
                graphs.render()
            )
        )
    );
}
