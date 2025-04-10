import TerminalBox from '@components/TerminalBox';
import { input, label } from '@framework/tags';

export default function TfaView() {
    return TerminalBox(
        '2fa',
        label({}, 'Enter totp code'),
        input({
            type: 'text',
            name: 'token',
            id: 'token',
            inputMode: 'numeric',
            pattern: '[0-9]*',
            autocomplete: 'one-time-code',
        })
    );
}
