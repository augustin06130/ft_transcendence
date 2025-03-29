import { canvas, div } from '@framework/tags';
import Overlay from './Overlay';
import { Setter, UseStateType } from '@framework/UseState';
import { roomId } from '@views/Room';
import popOver from './PopOver';
import popUp, { PopUpElement } from './PopUp';
import { switchPage } from '@framework/Router';

export const WINNING_SCORE = 1;

export type GameMode = 'ai' | 'local' | 'remote';
export const gameModes: GameMode[] = ['ai', 'local', 'remote'];

type Role = 'player1' | 'player2' | 'local' | 'spec';

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
};

const zeroGameSate = {
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
	private computerIntervallId: number = 0;
	private overlays: { [key: string]: Overlay } = {};
	public leavePopUp: PopUpElement;

	constructor(
		gameMode: UseStateType<GameMode>,
		name1Set: Setter<string>,
		name2Set: Setter<string>,
		topTextSet: Setter<string>
	) {
		if (roomId.get() === '')
			switchPage('/room');
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

		this.leavePopUp = popUp("Leave", "If you leave this page, you will loose the game")

		this.overlays['start'] = new Overlay(
			'TERMINAL PONG',
			`First to ${WINNING_SCORE} wins`,
			'READY',
			() => this.sendCmd('ready'),
		);
		this.overlays['register'] = new Overlay(
			'Enter game',
			'',
			'REGISTER',
			() => this.sendCmd('register'),
		);
		this.overlays['score'] = new Overlay(
			'',
			'',
			'PLAY AGAIN',
			() => this.switchOverlay('register'),
		);
		this.overlays['error'] = new Overlay(
			'Error',
			'An error occured',
			'RETRY',
			() => { },
		);
		this.switchOverlay('register');
		this.socket = new WebSocket(`ws://${window.location.host}/pong-ws`);
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
	};

	private switchOverlay(name: string = '') {
		console.log("overlays", name);
		Object.keys(this.overlays).forEach((key) => {
			if (key === name) {
				this.overlays[key].show()
			}
			else {
				this.overlays[key].hide()
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
			case 'role':
				this.state.role = data.arg0 as Role;
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
			this.computerIntervallId = 0;
		}
	}

	private setNameHandle(data: Cmd) {
		this.handleResize();
		this.gameMode.set(data.arg0 as GameMode);

		this.name1Set(data.arg1);
		this.name2Set(data.arg2);

		this.overlays['start'].showButton();
		if (this.state.role === 'spec') {
			this.overlays['start'].hideButton();
			this.topTextSet('Spectator');
		} else if (this.gameMode.get() === 'local') this.topTextSet(`◄► You are playing localy ◄►`);
		else if (this.state.role === 'player1')
			this.topTextSet(`◄◄ You are playing as ${data.arg1} ◄◄`);
		else if (this.state.role === 'player2')
			this.topTextSet(`►► You are playing as ${data.arg2} ►►`);
	}

	private inGameHandle(data: Cmd) {
		this.state.ingame = !!parseInt(data.arg0);
		if (!this.state.ingame) return;
		if (this.gameMode.get() === 'ai')
			this.computerIntervallId = setInterval(this.updateComputerView, 100);
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
			game: JSON.parse(JSON.stringify(zeroGameSate)),
			aiState: {
				current: JSON.parse(JSON.stringify(zeroGameSate)),
				previous: JSON.parse(JSON.stringify(zeroGameSate)),
			},
		};
		return this.state;
	}

	private updateGame(data: Cmd) {
		// this.switchOverlay('');
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

	private updateComputerView() {
		this.state.aiState.previous = JSON.parse(JSON.stringify(this.state.aiState.current));
		this.state.aiState.current = JSON.parse(JSON.stringify(this.state.game));
	}

	private updateComputer() {
		const [m, b] = this.linest(
			this.state.aiState.current.ballX,
			this.state.aiState.current.ballY,
			this.state.aiState.previous.ballX,
			this.state.aiState.previous.ballY
		);

		const ballHitYcomputer = this.findIntersectComputer(m, b);

		if (
			ballHitYcomputer >
			this.state.aiState.current.computerY + this.state.aiState.current.computerHeight
		) {
			window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }));
		} else if (ballHitYcomputer < this.state.aiState.current.computerY) {
			window.dispatchEvent(new KeyboardEvent('keydown', { key: 'i' }));
		} else {
			window.dispatchEvent(new KeyboardEvent('keyup', { key: 'i' }));
		}
	}

	private linest(x1: number, y1: number, x2: number, y2: number) {
		const m = (y2 - y1) / (x2 - x1);
		return [m, y1 - m * x1];
	}

	private findIntersectComputer(m: number, b: number): number {
		const hitY = m * this.state.canvasWidth + b;
		if (hitY < 0) {
			return this.findIntersectComputer(-m, -b);
		} else if (hitY > this.state.canvasHeight) {
			return this.findIntersectComputer(-m, 2 * this.state.canvasHeight - b);
		}
		return hitY;
	}

	// autoPlayer() {
	// 	const [m, b] = this.linest(
	// 		this.state.aiState.current.ballX,
	// 		this.state.aiState.current.ballY,
	// 		this.state.aiState.previous.ballX,
	// 		this.state.aiState.previous.ballY
	// 	);
	//
	// 	const ballHitYplayer = this.findIntersectPlayer(m, b);
	//
	// 	if (
	// 		ballHitYplayer + 1 >
	// 		this.state.aiState.current.playerY + this.state.aiState.current.playerHeight
	// 	) {
	// 		window.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }));
	// 	} else if (ballHitYplayer - 1 < this.state.aiState.current.playerY) {
	// 		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
	// 	} else {
	// 		window.dispatchEvent(new KeyboardEvent('keyup', { key: 'w' }));
	// 	}
	// }
	//
	// findIntersectPlayer(m: number, b: number): number {
	// 	const hitY = b;
	// 	if (hitY < 0) {
	// 		return this.findIntersectPlayer(-m, -b);
	// 	} else if (hitY > this.state.canvasHeight) {
	// 		return this.findIntersectPlayer(-m, 2 * this.state.canvasHeight - b);
	// 	}
	//
	// 	return hitY;
	// }
}
