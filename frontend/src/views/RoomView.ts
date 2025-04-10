import OnlineFriends from '@components/OnlineFriends';
import TerminalBox from '@components/TerminalBox';
import { div } from '@framework/tags';
import Room from '@components/Room';

export default function RoomView() {
    const boxClassname = 'p-4 mx-auto border border-green-500/30 rounded p-4 flex-auto ';
    const friendsBox = new OnlineFriends();
    return TerminalBox(
        '/room',
        div(
            { className: '' },
            div({ className: boxClassname + 'max-w-md mb-10' }, Room()),
            div({ className: boxClassname }, friendsBox.render())
        )
    );
}
