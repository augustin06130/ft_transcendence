import { canvas, div } from '@framework/tags';
import Overlay from './Overlay';
import { Setter, UseStateType } from '@framework/UseState';
import { roomId } from '@views/Room';
import popOver from './PopOver';
import popUp, { PopUpElement } from './PopUp';
import { switchPage } from '@framework/Router';
import { GameMode, Role } from 'types';

export const WINNING_SCORE = 3;

export const gameModes: GameMode[] = ['ai', 'local', 'remote'];

type GameState = {
	ballX: number;
	ballY: number;
	playerY: number;
	computerY: number;
	playerScore: number;
	computerScore: number;
	playerHeight: number;
	computerHeight: number;
	ballRadius: number;
	paddleWidth: number;
	speedX: number;
	speedY: number;
};

type AiState = {
	previous: GameState;
	current: GameState;
};

type PongState = {
	canvasWidth: number;
	canvasHeight: number;
	role: Role;
	deltaYplayer: number;
	deltaYcomputer: number;
	ingame: boolean;
	game: GameState;
	aiState: AiState;
	continue: boolean;
};

const zeroGameSate: GameState = {
	ballX: 0,
	ballY: 0,
	playerY: 0,
	computerY: 0,
	playerScore: 0,
	computerScore: 0,
	playerHeight: 0,
	computerHeight: 0,
	ballRadius: 0,
	paddleWidth: 0,
	speedX: -1,
	speedY: -1,
};

type Cmd = {
	cmd: string;
	[key: `arg${number}`]: string;
};

export default class PongGame {
	private gameMode: UseStateType<GameMode>;
	private name1Set: Setter<string>;
	private name2Set: Setter<string>;
	private topTextSet: Setter<string>;
	private socket: WebSocket;
	private canvasElement: HTMLCanvasElement;
	private state: PongState = this.reset();
	private computerIntervallId: ReturnType<typeof setInterval> | null = null;
	private overlays: { [key: string]: Overlay } = {};
	public leavePopUp: PopUpElement;
	private userName: string;
	public isError: boolean = false;

	constructor(
		gameMode: UseStateType<GameMode>,
		name1Set: Setter<string>,
		name2Set: Setter<string>,
		topTextSet: Setter<string>
	) {
		if (roomId.get() === '') switchPage('/room');
		this.userName = '';
		this.gameMode = gameMode;
		this.name1Set = name1Set;
		this.name2Set = name2Set;
		this.topTextSet = topTextSet;
		this.canvasElement = canvas({
			className: 'w-full h-full border border-green-500/30 rounded',
		});
		this.messageHanle = this.messageHanle.bind(this);
		this.handleResize = this.handleResize.bind(this);
		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.handleKeyUp = this.handleKeyUp.bind(this);
		this.updateComputerView = this.updateComputerView.bind(this);
		window.addEventListener('resize', this.handleResize);
		window.addEventListener('keydown', this.handleKeyDown);
		window.addEventListener('keyup', this.handleKeyUp);

		this.leavePopUp = popUp('Leave', 'If you leave this page, you will loose the game');

		this.overlays['start'] = new Overlay('', `First to ${WINNING_SCORE} wins`, 'READY', () =>
			this.sendCmd('ready')
		);
		this.overlays['register'] = new Overlay(
			'Register for the next game of tournament',
			'',
			'REGISTER',
			() => this.sendCmd('register')
		);
		this.overlays['score'] = new Overlay('', '', 'PLAY AGAIN', () => {
			if (this.state.continue) {
				this.sendCmd('next');
				this.switchOverlay('start');
			} else this.switchOverlay('register');
		});
		this.overlays['error'] = new Overlay('Error', 'An error occured', 'Home', () => {
			location.href = '/';
		});
		this.switchOverlay('register');
		this.socket = new WebSocket(`wss://${window.location.host}/api/pong`);
		this.socket.onopen = () => {
			this.sendCmd('roomId', roomId.get());
		};
		this.socket.onmessage = event => this.messageHanle(event);
		this.socket.onerror = err => console.error('Socket error:', err);
		this.socket.onclose = () => {
			this.displayError('You got disconnected');
			roomId.set('');
		};
	}

	public close() {
		// roomId.set('');
		this.socket.close();
	}

	public isPlayer() {
		return this.state.role !== 'spec';
	}

	private switchOverlay(name: string = '') {
		if (name === 'error') this.isError = true;
		Object.keys(this.overlays).forEach(key => {
			if (key === name) {
				this.overlays[key].show();
			} else {
				this.overlays[key].hide();
			}
		});
	}

	private messageHanle(msg: MessageEvent) {
		const data: Cmd = JSON.parse(msg.data);
		if (data.cmd != 'update') console.log('ws data:', data);
		switch (data.cmd) {
			case 'registered':
				this.switchOverlay('start');
				break;
			case 'username':
				this.userName = data.arg0;
				break;
			case 'setNames':
				this.setNameHandle(data);
				break;
			case 'update':
				this.updateGame(data);
				break;
			case 'score':
				this.scoreHandle(data);
				break;
			case 'ingame':
				this.inGameHandle(data);
				break;
			case 'queuePosition':
				this.overlays['start'].setMessage(
					`Your position in the queue: ${data.arg0}/${data.arg1} for the next game`
				);
				this.overlays['register'].setMessage(`Players in the waiting room: ${data.arg1}`);
				break;
			case 'next':
				this.switchOverlay('start');
				break;
			case 'error':
				this.displayError(data.arg0);
				break;
			case 'info':
				popOver.show(data.arg0);
				break;
		}
	}

	private scoreHandle(data: Cmd) {
		this.overlays['score'].setTitle(`${data.arg0} WON !`);
		this.overlays['score'].setMessage(
			`score ${this.state.game.playerScore} - ${this.state.game.computerScore}`
		);
		this.state.ingame = false;
		this.switchOverlay('score');
		if (this.computerIntervallId) {
			clearInterval(this.computerIntervallId);
			this.computerIntervallId = null;
		}
	}

	private setNameHandle(data: Cmd) {
		this.handleResize();
		this.gameMode.set(data.arg0 as GameMode);
		this.name1Set(data.arg1);
		this.name2Set(data.arg2);
		this.overlays['start'].setTitle(data.arg3);

		if (this.userName === data.arg1) {
			this.state.role = 'player1';
		} else if (this.userName === data.arg2) {
			this.state.role = 'player2';
		} else this.state.role = 'spec';

		this.overlays['start'].showButton();
		if (this.state.role === 'spec') {
			this.overlays['start'].hideButton();
			this.topTextSet('Spectator');
		} else if (this.gameMode.get() === 'local') {
			this.topTextSet(`◄► You are playing localy ◄►`);
		} else if (this.state.role === 'player1') {
			this.topTextSet(`◄◄ You are playing as ${data.arg1} ◄◄`);
		} else if (this.state.role === 'player2') {
			this.topTextSet(`►► You are playing as ${data.arg2} ►►`);
		}
	}

	private inGameHandle(data: Cmd) {
		this.state.ingame = parseInt(data.arg0) > 0;
		this.state.continue = this.gameMode.get() === 'remote' && parseInt(data.arg0) === -1;
		this.state.continue = parseInt(data.arg0) === -1;
		if (!this.state.ingame) return;
		if (this.gameMode.get() === 'ai') {

			this.computerIntervallId = setInterval(this.updateComputerView, 1000);
			this.updateComputerView();
		}
		this.handleResize();
		this.switchOverlay();
	}

	private displayError(msg: string) {
		this.overlays['error'].setMessage(msg);
		this.switchOverlay('error');
	}

	public sendCmd(cmd: string, ...args: string[]) {
		let obj: Cmd = { cmd: cmd };
		args.forEach((arg, i) => (obj[`arg${i}`] = arg));
		this.socket.send(JSON.stringify(obj));
	}

	private reset() {
		this.state = {
			ingame: false,
			deltaYplayer: 0,
			deltaYcomputer: 0,
			canvasWidth: 0,
			canvasHeight: 0,
			role: 'spec',
			continue: false,
			game: Object.assign({}, zeroGameSate),
			aiState: {
				current: Object.assign({}, zeroGameSate),
				previous: Object.assign({}, zeroGameSate),
			},
		};
		this.state.aiState.current.ballX = this.state.canvasWidth / 2;
		this.state.aiState.current.ballY = this.state.canvasHeight / 2;
		this.state.aiState.previous.ballX = this.state.canvasWidth / 2;
		this.state.aiState.previous.ballY = this.state.canvasHeight / 2;
		return this.state;
	}

	private updateGame(data: Cmd) {
		this.state.game.ballX = (parseInt(data.arg0) / 1000) * this.state.canvasWidth;
		this.state.game.ballY = (parseInt(data.arg1) / 1000) * this.state.canvasHeight;
		this.state.game.playerY = (parseInt(data.arg2) / 1000) * this.state.canvasHeight;
		this.state.game.computerY = (parseInt(data.arg3) / 1000) * this.state.canvasHeight;
		this.state.game.playerScore = parseInt(data.arg4);
		this.state.game.computerScore = parseInt(data.arg5);
		this.state.game.playerHeight = (parseInt(data.arg6) / 1000) * this.state.canvasHeight;
		this.state.game.computerHeight = (parseInt(data.arg7) / 1000) * this.state.canvasHeight;
		this.state.game.ballRadius = (parseInt(data.arg8) / 1000) * this.state.canvasHeight;
		this.state.game.paddleWidth = (parseInt(data.arg9) / 1000) * this.state.canvasWidth;

		this.drawGame();

		this.moveLeftPaddle();

		if (this.gameMode.get() === 'ai') this.updateComputer();
		this.moveRightPaddle();
	}

	private moveLeftPaddle() {
		if (this.state.role === 'player1')
			this.sendCmd('paddle', 'player', this.state.deltaYplayer.toString());
	}

	private moveRightPaddle() {
		if (
			(this.state.role === 'player1' && this.gameMode.get() === 'ai') ||
			(this.state.role === 'player1' && this.gameMode.get() === 'local') ||
			this.state.role == 'player2'
		)
			this.sendCmd('paddle', 'computer', this.state.deltaYcomputer.toString());
	}

	private handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'w' || e.key === 'W') this.state.deltaYplayer = -1;
		else if (e.key === 's' || e.key === 'S') this.state.deltaYplayer = 1;
		if (e.key === 'i' || e.key === 'I') this.state.deltaYcomputer = -1;
		else if (e.key === 'k' || e.key === 'K') this.state.deltaYcomputer = 1;
	}

	private handleKeyUp(e: KeyboardEvent) {
		if (e.key === 'w' || e.key === 'W' || e.key === 's' || e.key === 'S')
			this.state.deltaYplayer = 0;
		if (e.key === 'i' || e.key === 'I' || e.key === 'k' || e.key === 'K')
			this.state.deltaYcomputer = 0;
	}

	private handleResize() {
		const container = this.canvasElement.parentElement;
		if (!container) return;

		this.canvasElement.width = container.clientWidth;
		this.canvasElement.height = container.clientHeight;

		this.state.canvasWidth = this.canvasElement.width;
		this.state.canvasHeight = this.canvasElement.height;

		this.drawGame();
	}

	private drawLine(m: number, b: number) {
		const ctx = this.canvasElement.getContext('2d');
		if (!ctx) return;
		ctx.strokeStyle = '#ff00ff';
		ctx.beginPath();
		ctx.moveTo(0, b);
		ctx.lineTo(this.state.canvasWidth, m * this.state.canvasWidth + b);
		ctx.stroke();
	}

	private drawPoint(x: number, y: number, color: string) {
		const ctx = this.canvasElement.getContext('2d');
		if (!ctx) return;
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(x, y, this.state.game.ballRadius, 0, Math.PI * 2);
		ctx.fill();
	}

	private drawGame() {
		const ctx = this.canvasElement.getContext('2d');
		if (!ctx) return;

		ctx.fillStyle = '#000000';
		ctx.fillRect(0, 0, this.state.canvasWidth, this.state.canvasHeight);

		ctx.strokeStyle = '#00ff00';
		ctx.setLineDash([10, 15]);
		ctx.beginPath();
		ctx.moveTo(this.state.canvasWidth / 2, 0);
		ctx.lineTo(this.state.canvasWidth / 2, this.state.canvasHeight);
		ctx.stroke();
		ctx.setLineDash([]);

		ctx.fillStyle = '#00ff00';
		ctx.fillRect(
			0,
			this.state.game.playerY,
			this.state.game.paddleWidth,
			this.state.game.playerHeight
		);
		ctx.fillRect(
			this.state.canvasWidth - this.state.game.paddleWidth,
			this.state.game.computerY,
			this.state.game.paddleWidth,
			this.state.game.computerHeight
		);

		ctx.beginPath();
		ctx.arc(
			this.state.game.ballX,
			this.state.game.ballY,
			this.state.game.ballRadius,
			0,
			Math.PI * 2
		);
		ctx.fill();

		ctx.font = '30px monospace';
		ctx.textAlign = 'center';
		ctx.fillText(this.state.game.playerScore.toString(), this.state.canvasWidth / 4, 50);
		ctx.fillText(this.state.aiState.current.speedX.toString(), this.state.canvasWidth / 2, 50);
		ctx.fillText(
			this.state.game.computerScore.toString(),
			(this.state.canvasWidth * 3) / 4,
			50
		);
	}

	public render() {
		return div(
			{ className: 'relative w-full', style: { height: '60vh' } },
			this.canvasElement,
			this.leavePopUp,
			...Object.values(this.overlays).map(o => o.render())
		);
	}

	/****************************************************/
	/*********************** AI *************************/
	/****************************************************/
	private sameSign(x: number, y: number) {
		if (x < 0 && y < 0)
			return true;
		if (x > 0 && y > 0)
			return true;
		if (x == 0 && y == 0)
			return true;
		return false;

	}

	private getNextBall(X: number, Y: number, vX: number, vY: number): number {
		let nextX, nextY, finished = false;
		this.drawPoint(X, Y, '#ff00ff');

		nextX = X + vX;
		nextY = Y + vY;

		if (nextY < 0) {
			nextY = -nextY;
			vY = -vY;
		}
		else if (nextY > this.state.canvasHeight) {
			nextY = this.state.canvasHeight - nextY;
			vY = -vY;
		}
		if (nextX < this.state.game.paddleWidth) {
			nextY = Y + (X - this.state.game.paddleWidth) / vX * vY;
			nextX = -nextX
			vX = -vX;
		}
		if (nextX > this.state.canvasWidth - this.state.game.paddleWidth) {
			nextY = Y + (X - this.state.game.paddleWidth - this.state.canvasWidth) / vX * vY;
			vX = -vX;
			finished = true;
		}
		if (!finished) {
			return this.getNextBall(nextX, nextY, vX, vY);
		}
		return nextY;
	}

	private updateComputerView() {
		this.state.aiState.previous = Object.assign({}, this.state.aiState.current);
		this.state.aiState.current = Object.assign({}, this.state.game);

		this.state.aiState.current.speedX = this.state.aiState.current.ballX - this.state.aiState.previous.ballX;
		this.state.aiState.current.speedY = this.state.aiState.current.ballY - this.state.aiState.previous.ballY;

		// if (this.sameSign(this.state.aiState.current.speedX, this.state.aiState.previous.speedX)) {
		// 	// 	this.state.aiState.previous.ballY = (this.state.aiState.current.ballY + this.state.aiState.previous.ballY) / 2;
		// 	// 	if (this.state.aiState.current.directionX > 0) {
		// 	// 		this.state.aiState.previous.ballX = this.state.game.paddleWidth;
		// 	// 	} else {
		// 	// 		this.state.aiState.previous.ballX = this.state.canvasWidth - this.state.game.paddleWidth;
		// 	// 	}
		// }
		// if (this.sameSign(this.state.aiState.current.speedY, this.state.aiState.previous.speedY)) {
		// 	const x = this.state.aiState.current.ballY - this.state.aiState.previous.ballY;
		// 	if (this.state.aiState.current.speedY > 0) {
		// 		this.state.aiState.previous.ballY = 0
		// 		this.state.aiState.previous.ballY -= x / (this.state.aiState.current.ballY / this.state.aiState.previous.ballY + 1);
		// 	} else {
		// 		this.state.aiState.previous.ballY = this.state.canvasHeight
		// 		this.state.aiState.previous.ballY -= x / ((this.state.canvasHeight - this.state.aiState.current.ballY) / (this.state.canvasHeight - this.state.aiState.previous.ballY) + 1);
		// 	}
		// }
	}

	// private linest(x1: number, y1: number, x2: number, y2: number) {
	// 	const m = (y2 - y1) / (x2 - x1);
	// 	return [m, y1 - m * x1];
	// }

	private updateComputer() {
		// const [m, b] = this.linest(
		// 	this.state.aiState.current.ballX,
		// 	this.state.aiState.current.ballY,
		// 	this.state.aiState.previous.ballX,
		// 	this.state.aiState.previous.ballY
		// );
		//

		// const ballHitYcomputer = this.findIntersectComputer(m, b, this.state.aiState.current.speedX);

		//debug
		// this.drawPoint(this.state.aiState.previous.ballX, this.state.aiState.previous.ballY, '#ff0000');
		// this.drawPoint(this.state.aiState.current.ballX, this.state.aiState.current.ballY, '#0000ff');
		// this.drawPoint(this.state.canvasWidth, ballHitYcomputer, '#ff00ff');
		const ballHitYcomputer = this.getNextBall(this.state.aiState.current.ballX, this.state.aiState.current.ballY, this.state.aiState.current.speedX, this.state.aiState.current.speedY);

		if (
			ballHitYcomputer >
			this.state.game.computerY +
			this.state.game.computerHeight
			- this.state.game.computerHeight * 0.40
		) {
			window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }));
		} else if (
			ballHitYcomputer <
			this.state.game.computerY
			+ this.state.game.computerHeight * 0.40
		) {
			window.dispatchEvent(new KeyboardEvent('keydown', { key: 'i' }));
		} else {
			window.dispatchEvent(new KeyboardEvent('keyup', { key: 'i' }));
		}

		// if (
		// 	ballHitYcomputer >
		// 	this.state.game.computerY +
		// 	this.state.game.computerHeight
		// 	- this.state.game.computerHeight * 0.40
		// ) {
		// 	window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }));
		// } else if (
		// 	ballHitYcomputer <
		// 	this.state.game.computerY
		// 	+ this.state.game.computerHeight * 0.40
		// ) {
		// 	window.dispatchEvent(new KeyboardEvent('keydown', { key: 'i' }));
		// } else {
		// 	window.dispatchEvent(new KeyboardEvent('keyup', { key: 'i' }));
		// }
	}

	private findIntersectComputer(m: number, b: number, directionX: number): number {
		let hitY;

		//debug
		this.drawLine(m, b);

		if (directionX > 0) {
			hitY = m * this.state.canvasWidth + b;
			if (hitY < 0) {
				return this.findIntersectComputer(-m, -b, directionX);
			} else if (hitY > this.state.canvasHeight) {
				return this.findIntersectComputer(-m, 2 * this.state.canvasHeight - b, directionX);
			}
		} else {
			hitY = b;
			if (hitY < 0) {
				return this.findIntersectComputer(-m, -b, -directionX);
			} else if (hitY > this.state.canvasHeight) {
				return this.findIntersectComputer(-m, 2 * this.state.canvasHeight - b, -directionX);
			} else {
				return this.findIntersectComputer(0, hitY, -directionX);
			}
		}
		return hitY;
	}
}
