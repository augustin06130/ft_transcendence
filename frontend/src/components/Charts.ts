import { canvas, div, h2 } from '@framework/tags';

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
	}

	handleResize() {
		const container = this.canvasElement.parentElement;
		if (!container) return;
		this.side = Math.min(container.clientWidth, container.clientHeight) - 10;
		this.canvasElement.width = this.side;
		this.canvasElement.height = this.side;
		this.drawChart();
	}

	drawChart() { }

	render() {
		return div({}, h2({ className: 'font-bold' }, this.title), this.canvasElement);
	}
}

export class PieChart extends Chart {
	private data: Section[] = [];
	private radius: number = 0;
	private total: number = 0;

	constructor(title: string) {
		super(title);
		this.setData({ name: 'Pong', value: 1 }, { name: 'Ping', value: 1 })
	}

	setData(...sections: Section[]) {
		this.data = sections;
		this.total = this.data.reduce((tot, point) => tot + point.value, 0);
		this.handleResize();
		setTimeout(() => this.handleResize(), 10);
		setTimeout(() => this.handleResize(), 20);
		this.drawChart();
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
		ctx.arc(this.side / 2, this.side / 2, Math.max(0, this.radius), 0, 2 * Math.PI);
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

			const txt = `${nextPoint.name} ${nextPoint.value}`
			x = this.side / 2 - (this.radius / 2) * Math.cos(midAngle) - txt.length * 5;
			y = this.side / 2 - (this.radius / 2) * Math.sin(midAngle) + 20;

			ctx.font = '16px mono';
			ctx.fillText(txt, x, y);

			acc += point.value;
		}
	}
}

export class LineChart extends Chart {
	private data: Point[] = [];
	private scaleX: number = 0;
	private scaleY: number = 0;
	private origin: Point = { x: 0, y: 0 };
	private axisLength: number = 0;
	private minX: number = 0;
	private maxX: number = 0;
	private minY: number = 0;
	private maxY: number = 0;
	private drawLines: boolean;

	constructor(title: string, drawLines: boolean = true) {
		super(title);
		this.setData({ x: 0, y: 0 }, { x: 1, y: 500 }, { x: 2, y: 200 });
		this.drawLines = drawLines;
	}

	setData(...data: Point[]) {
		this.data = data;
		this.minX = 0;
		this.maxX = Math.max(...this.data.map(v => v.x));
		this.minY = 0;
		this.maxY = Math.max(...this.data.map(v => v.y));
		this.handleResize();
		setTimeout(() => this.handleResize(), 10);
		setTimeout(() => this.handleResize(), 20);
		this.drawChart();
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
		ctx.fillText(this.minX.toString(), this.origin.x, this.origin.y + 23);
		ctx.fillText(
			this.maxX.toString(),
			this.side * 0.9,
			this.origin.y + 23
		);
		ctx.fillText(this.minY.toString(), this.origin.x - 23, this.origin.y - 5);
		ctx.fillText(
			this.maxY.toString(),
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

			if (i > 0 && this.drawLines) {
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
