import TerminalBox from '@components/TerminalBox';
import { button, div, p } from '@framework/tags';
import { getCookie } from '@framework/cookies';
import { History } from '@components/History';
import Profile from '@components/Profile';
import { Graphs, Stats } from './Stats';
import popUp from '@components/PopUp';
import popOver from '@components/PopOver';

export default function ProfileView(username: string | undefined = undefined) {
    if (!username) username = getCookie('username');
    if (!username) return div({});

    let deletePopup = popUp(
        'Confirm account deletion',
        'You are about to delete your account permanently there is no going back. All your data will be lost'
    );
    let stats = new Stats(username);
    let graphs = new Graphs(username);
    let history = History(username);

    return TerminalBox(
        '/profile',
        deletePopup,
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
                        'col-span-2 border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10',
                },
                p({ className: 'text-xl text-green-500 font-bold' }, 'USER HISTORY'),
                history
            ),
            div(
                {
                    className:
                        'col-span-2 border border-green-500/30 rounded p-4 pb-12 bg-black/80 shadow-lg shadow-green-500/10',
                },
                p({ className: 'text-xl text-green-500 font-bold' }, 'USER CHARTS '),
                graphs.render()
            ),
            div(
                { className: 'col-span-2 flex justify-center' },
                button(
                    {
                        className: 'text-green-400/70 text-sm hover:text-red-400/100',
                        onclick: () => {
                            deletePopup.show(resp => {
                                if (resp) {
                                    const url = new URL(
                                        '/api/profile/delete',
                                        window.location.href
                                    );
                                    fetch(url)
                                        .then(resp => resp.json())
                                        .then(json => {
                                            if (!json.success) throw json.message;
                                            window.location.href = '/';
                                        })
                                        .catch(err => popOver.show(err));
                                }
                                deletePopup.hide();
                            });
                        },
                    },
                    'delete account'
                )
            )
        )
    );
}
