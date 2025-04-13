import { Setter, UseStateType } from '@framework/UseState';
import { switchPage } from '@framework/Router';
import { canvas, div } from '@framework/tags';
import popUp, { PopUpElement } from './PopUp';
import { GameMode, Role } from 'types';
import Overlay from './Overlay';
import popOver from './PopOver';

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
	dt: number;
};

type PongState = {
	canvasWidth: number;
	canvasHeight: number;
	role: Role;
	deltaYplayer: number;
	deltaYcomputer: number;
	ingame: boolean;
	game: GameState;
	aiState: GameState;
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
	dt: 0,
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
	private overlays: { [key: string]: Overlay } = {};
	public leavePopUp: PopUpElement;
	private userName: string;
	public isError: boolean = false;
	public delayballHitYcomputer: number = 0;
	private ballHitYcomputer: number = 0;
	private delay: number = 0;

	constructor(
		gameMode: UseStateType<GameMode>,
		name1Set: Setter<string>,
		name2Set: Setter<string>,
		topTextSet: Setter<string>,
		roomId: string | null
	) {
		if (!roomId) switchPage('/room');

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
			this.sendCmd('roomId', roomId as string);
		};
		this.socket.onmessage = event => this.messageHanle(event);
		this.socket.onerror = err => console.error('Socket error:', err);
		this.socket.onclose = () => {
			this.displayError('You got disconnected');
		};
	}


	public close() {
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
		this.delay = 900;
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
			aiState: Object.assign({}, zeroGameSate),
		};
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
		this.state.game.speedX = parseFloat(data.arg10) * this.state.canvasWidth / 500;
		this.state.game.speedY = parseFloat(data.arg11) * this.state.canvasHeight / 500;
		this.state.game.dt = parseFloat(data.arg12);

		this.drawGame();
		if (this.gameMode.get() === 'ai') {
			this.delay += this.state.game.dt;
			if (this.delay >= 1000) {
				Object.assign(this.state.aiState, this.state.game);
				this.delay -= 1000;
				this.ballHitYcomputer = this.getNextBall(
					this.state.aiState.ballX,
					this.state.aiState.ballY,
					this.state.aiState.speedX,
					this.state.aiState.speedY,
					this.state.aiState.dt
				);
			}
			this.updateComputer();
		}
		this.moveLeftPaddle();
		this.moveRightPaddle();
	}

	/****************************************************/
	/*********************** AI *************************/
	/****************************************************/

	private getNextBall(
		x: number,
		y: number,
		Vx: number,
		Vy: number,
		dt: number,
		d: number = 0
	): number {
		let nextX, nextY, dtHit;
		nextX = x + (Vx * dt);
		nextY = y + (Vy * dt);
		if (nextY < 0) {
			dtHit = y / Vy;
			return this.getNextBall(x + Vx * dtHit, 0, Vx, -Vy, dt - dtHit, d + 1);
		}
		if (nextY > this.state.canvasHeight) {
			dtHit = (this.state.canvasHeight - y) / Vy;
			return this.getNextBall(x + Vx * dtHit, this.state.canvasHeight, Vx, -Vy, dt - dtHit, d + 1);
		}
		if (nextX < this.state.game.paddleWidth) {
			dtHit = (x - this.state.aiState.paddleWidth) / Vx;
			return this.getNextBall(
				this.state.game.paddleWidth,
				y + Vy * dtHit,
				-Vx,
				Vy,
				dt - dtHit,
				d + 1
			);
		}
		if (nextX > this.state.canvasWidth - this.state.game.paddleWidth) {
			dtHit = (this.state.canvasWidth - x - this.state.game.paddleWidth) / Vx;
			console.log('depth', d)
			return y + Vy * dtHit;
		}
		return this.getNextBall(nextX, nextY, Vx, Vy, dt, d + 1);
	}

	private updateComputer() {
		if (
			this.ballHitYcomputer >
			this.state.game.computerY +
			this.state.game.computerHeight -
			this.state.game.computerHeight * 0.4
		) {
			window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }));
		} else if (
			this.ballHitYcomputer <
			this.state.game.computerY + this.state.game.computerHeight * 0.3
		) {
			window.dispatchEvent(new KeyboardEvent('keydown', { key: 'i' }));
		} else {
			window.dispatchEvent(new KeyboardEvent('keyup', { key: 'i' }));
		}
	}

	/****************************************************/
	/********************** DRAW ************************/
	/****************************************************/

	private handleResize() {
		const container = this.canvasElement.parentElement;
		if (!container) return;

		this.canvasElement.width = container.clientWidth;
		this.canvasElement.height = container.clientHeight;

		this.state.canvasWidth = this.canvasElement.width;
		this.state.canvasHeight = this.canvasElement.height;

		this.drawGame();
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

		ctx.fillStyle = '#00ff00';
		ctx.font = '30px monospace';
		ctx.textAlign = 'center';
		ctx.fillText(this.state.game.playerScore.toString(), this.state.canvasWidth / 4, 50);
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
	/*********************** MOVE ***********************/
	/****************************************************/

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
}
