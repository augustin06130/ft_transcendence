import { canvas } from '@framework/tags';

export type Section = {
    name: string;
    value: number;
};

export type Point = {
    x: number;
    y: number;
};

class Chart {
    canvasElement: HTMLCanvasElement;
    side: number = 0;
    private title: string;
    constructor(title: string) {
        this.title = title;
        this.canvasElement = canvas({
            className: 'w-full h-full border border-green-500/30 rounded',
        });
        this.handleResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.handleResize);
        setTimeout(() => this.handleResize(), 1);
        setTimeout(() => this.handleResize(), 1);
    }

    handleResize() {
        const container = this.canvasElement.parentElement;
        if (!container) return;
        this.side = Math.min(container.clientWidth, container.clientHeight) - 10;
        this.canvasElement.width = this.side;
        this.canvasElement.height = this.side;
        this.drawChart();
    }

    drawChart() {}

    render() {
        return div({}, h2({ className: 'font-bold' }, this.title), this.canvasElement);
    }
}

export class PieChart extends Chart {
    private total: number;
    private data: Section[];
    private radius: number = 0;

    constructor(title: string, ...sections: Section[]) {
        super(title);
        this.total = sections.reduce((tot, point) => tot + point.value, 0);
        this.data = sections;
    }

    handleResize() {
        super.handleResize();
        this.radius = (this.side / 2) * 0.9;
        this.drawChart();
    }

    drawChart() {
        super.drawChart();
        const ctx = this.canvasElement.getContext('2d');
        if (!ctx) return console.error('no ctx for pie');
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, this.side, this.side);

        ctx.fillStyle = '#00ff00';
        ctx.strokeStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(this.side / 2, this.side / 2, this.radius, 0, 2 * Math.PI);
        ctx.stroke();

        let acc = 0;
        let point, nextPoint, x, y, angle, nextAngle, midAngle;
        for (let i = 0; i < this.data.length; i++) {
            point = this.data[i];
            angle = ((acc + point.value) / this.total) * 2 * Math.PI;
            x = this.side / 2 - this.radius * Math.cos(angle);
            y = this.side / 2 - this.radius * Math.sin(angle);

            ctx.beginPath();
            ctx.moveTo(this.side / 2, this.side / 2);
            ctx.lineTo(x, y);
            ctx.stroke();

            nextPoint = this.data[(i + 1) % this.data.length];
            nextAngle = ((acc + point.value + nextPoint.value) / this.total) * 2 * Math.PI;
            midAngle = (nextAngle + angle) / 2;

            x = this.side / 2 - (this.radius / 2) * Math.cos(midAngle) - point.name.length * 5;
            y = this.side / 2 - (this.radius / 2) * Math.sin(midAngle) + 5;

            ctx.font = '16px mono';
            ctx.fillText(point.name, x, y);

            acc += point.value;
        }
    }
}

export class LineChart extends Chart {
    private data: Point[];
    private scaleX: number = 0;
    private scaleY: number = 0;
    private origin: Point = { x: 0, y: 0 };
    private axisLength: number = 0;
    private minX: number;
    private maxX: number;
    private minY: number;
    private maxY: number;
    constructor(title: string, ...data: Point[]) {
        super(title);
        this.data = data;
        this.minX = data.reduce((min, p) => (p.x < min ? p.x : min), data[0].x);
        this.maxX = data.reduce((max, p) => (p.x > max ? p.x : max), data[0].x);
        this.minY = data.reduce((min, p) => (p.y < min ? p.y : min), data[0].y);
        this.maxY = data.reduce((max, p) => (p.y > max ? p.y : max), data[0].y);
    }

    handleResize() {
        super.handleResize();
        this.axisLength = this.side * 0.8;
        this.origin.x = this.side * 0.1;
        this.origin.y = this.side * 0.9;
        this.scaleX = this.axisLength / (this.maxX - this.minX);
        this.scaleY = this.axisLength / (this.maxY - this.minY);
        this.drawChart();
    }

    drawChart() {
        super.drawChart();
        const ctx = this.canvasElement.getContext('2d');
        if (!ctx) return console.error('no ctx for line');
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, this.side, this.side);

        ctx.fillStyle = '#00ff00';
        ctx.strokeStyle = '#00ff00';

        ctx.beginPath();
        ctx.moveTo(this.origin.x, this.origin.y);
        ctx.lineTo(this.side * 0.9, this.origin.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.origin.x, this.origin.y);
        ctx.lineTo(this.origin.x, this.side * 0.1);
        ctx.stroke();

        ctx.font = '12px mono';
        ctx.fillText(this.data[0].x.toString(), this.origin.x, this.origin.y + 23);
        ctx.fillText(
            this.data[this.data.length - 1].x.toString(),
            this.side * 0.9,
            this.origin.y + 23
        );
        ctx.fillText(this.data[0].y.toString(), this.origin.x - 23, this.origin.y - 5);
        ctx.fillText(
            this.data[this.data.length - 1].y.toString(),
            this.origin.x - 23,
            this.side * 0.1 - 5
        );

        let point, x, y;
        let prevX, prevY;
        for (let i = 0; i < this.data.length; i++) {
            point = this.data[i];
            x = this.origin.x + point.x * this.scaleX;
            y = this.origin.y - point.y * this.scaleY;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();

            if (i > 0) {
                ctx.beginPath();
                ctx.moveTo(prevX as number, prevY as number);
                ctx.lineTo(x, y);
                ctx.stroke();
            }

            prevX = x;
            prevY = y;
            ctx.stroke();
        }
    }
}
