import TerminalBox from '@components/TerminalBox';
import { button, div, p } from '@framework/tags';
import { History } from '@components/History';
import popOver from '@components/PopOver';
import { Graphs, Stats } from './Stats';
import popUp from '@components/PopUp';

export default function HistoryView() {
    let deletePopup = popUp(
        'Confirm account deletion',
        'You are about to delete your account permanently there is no going back. All your data will be lost'
    );
    let stats = new Stats();
    let graphs = new Graphs();
    let history = History();

    return TerminalBox(
        '/profile',
        deletePopup,
        div(
            {},
            div(
                {
                    className:
                        'border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10',
                },
                p({ className: 'text-xl text-green-500 font-bold' }, 'GLOBAL STATS'),
                stats.render()
            ),
            div(
                {
                    className:
                        'col-span-2 border border-green-500/30 rounded p-4 bg-black/80 shadow-lg shadow-green-500/10',
                },
                p({ className: 'text-xl text-green-500 font-bold' }, 'GLOBAL HISTORY'),
                history
            ),
            div(
                {
                    className:
                        'col-span-2 border border-green-500/30 rounded p-4 pb-12 bg-black/80 shadow-lg shadow-green-500/10',
                },
                p({ className: 'text-xl text-green-500 font-bold' }, 'GLOBAL CHARTS '),
                graphs.render()
            )
        )
    );
}
