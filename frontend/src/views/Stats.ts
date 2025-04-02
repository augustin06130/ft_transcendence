import { div, p, canvas, h2 } from '@framework/tags';
import TerminalBox, { footer } from '@components/TerminalBox';
import { PieChart, LineChart } from '@components/charts';

export default function StatsView() {
    const pie1 = new PieChart(
        'Pie',
        { name: 'ai', value: 5 },
        { name: 'local', value: 2 },
        { name: 'remote', value: 15 }
    );
    const pie2 = new PieChart('Pie', { name: 'win', value: 3 }, { name: 'lose', value: 1 });
    const line1 = new LineChart(
        'Line 1',
        { x: 0, y: 0 },
        { x: 1, y: 2 },
        { x: 2, y: 0 },
        { x: 3, y: 0 }
    );
    const line2 = new LineChart(
        'Line 2',
        { x: 0, y: 0 },
        { x: 1, y: 2 },
        { x: 2, y: 6 },
        { x: 3, y: 12 }
    );
    return TerminalBox(
        'terminal@user:~/stats',
        div(
            {
                className: `mx-auto max-w-7xl bg-black/80 shadow-lg shadow-green-500/10'}`,
            },
            div(
                { className: 'text-center mb-6' },
                p({ className: 'text-2xl font-bold tracking-wider' }, 'SYSTEM STATS')
            ),
            div(
                { className: 'grid grid-cols-4 gap-4' },
                pie1.render(),
                pie2.render(),
                line1.render(),
                line2.render()
            )
        ),
        footer()
    );
}
