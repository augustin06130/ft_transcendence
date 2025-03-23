import { canvas, div, h2, p, button } from "@framework/tags";

const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 10;
const BALL_RADIUS = 8;
export const WINNING_SCORE = 1;

export type gameModesType = 'ai' | 'pvp' | 'remote';
export const gameModes: gameModesType[] = ['ai', 'pvp', 'remote'];

type PongState = {
	role: "host" | "guest"
	connected: false;
	playerY: number;
	computerY: number;
	ballX: number;
	ballY: number;
	canvasWidth: number;
	canvasHeight: number;
	playerScore: number;
	computerScore: number;
	gameState: "connecting" | "ready" | "playing" | "score" | "spec"
	player: number;
}

function overlay(option: {
	title: string,
	message: string,
	labelName: string,
	onclick: () => void
}): HTMLElement {
	return div({ className: "absolute inset-0 flex flex-col items-center justify-center bg-black/80" },
		h2({ className: "text-2xl font-bold mb-4" }, option.title),
		p({ className: "mb-6" }, option.message),
		button({
			onclick: option.onclick,
			className: "px-6 py-2 border border-green-500 rounded hover:bg-green-500/20 transition"
		}, option.labelName)
	);
}

export default class PongGame {
	canvasElement: HTMLCanvasElement;
	state: PongState;
	overlayStart: HTMLElement;
	overlayRegister: HTMLElement;
	overlayScore: HTMLElement;
	overlayError: HTMLElement;
	gameMode: gameModesType;
	socket: WebSocket;

	constructor(gameMode: gameModesType) {
		this.gameMode = gameMode;

		this.handleResize = this.handleResize.bind(this);
		this.startGame = this.startGame.bind(this);
		this.registerGame = this.registerGame.bind(this);
		this.restartGame = this.restartGame.bind(this);

		this.canvasElement = canvas({
			className: "w-full h-full border border-green-500/30 rounded",
			event: {
				onMounted: this.handleResize,
			}
		});
		window.addEventListener("resize", this.handleResize);

		this.state = this.reset();

		this.overlayStart = overlay({
			title: "TERMINAL PONG",
			message: `First to ${WINNING_SCORE} wins`,
			labelName: "READY",
			onclick: this.startGame,
		});

		this.overlayRegister = overlay({
			title: `Enter game`,
			message: `Register for a tournament or a single game`,
			labelName: "REGISTER",
			onclick: this.registerGame
		});

		this.overlayScore = overlay({
			title: ``,
			message: ``,
			labelName: "PLAY AGAIN",
			onclick: this.restartGame
		});

		this.overlayError = overlay({
			title: 'Error',
			message: 'An error occured',
			labelName: "RETRY",
			onclick: () => { }
		});

		this.overlayRegister.style.visibility = "visible";
		this.overlayStart.style.visibility = "hidden";
		this.overlayScore.style.visibility = "hidden";
		this.overlayError.style.visibility = "hidden";

		this.socket = new WebSocket(`ws://${window.location.host}/pong-ws`);

		this.socket.onopen = () => {
			console.log("pong socket opened");
		}

		this.socket.onmessage = (event) => this.messageHanle(event, this);
		this.socket.onerror = (err) => console.error("Test error:", err);
		this.socket.onclose = (event) => console.log("Test socket closed:", event.code);
	}

	messageHanle(msg: MessageEvent, pong: PongGame) {
		const data = JSON.parse(msg.data);
		console.log("ws data:", data);
		switch (data.cmd) {
			case "registered":
				pong.overlayRegister.style.visibility = "hidden";
				pong.overlayStart.style.visibility = "visible";
				break;
			case "set":
				pong.state.player = data.arg0;
				break;
			case "update":
				this.updateGame(data);
				break;
			case "score":
				pong.overlayScore.children[0].innerHTML = `${data.arg0} WON !`
				pong.overlayScore.children[1].innerHTML = `score ${this.state.playerScore} - ${this.state.computerScore}`;
				pong.overlayScore.style.visibility = "visible";
				break;
			case "error":
				pong.overlayRegister.style.visibility = "hidden";
				pong.overlayStart.style.visibility = "hidden";
				pong.overlayScore.style.visibility = "hidden";
				pong.overlayError.style.visibility = "visible";
				pong.overlayError.children[1].innerHTML = data.arg0;
				break;
		}
	}

	sendCmd(cmd: string, ...args: (string | number)[]) {
		let obj: any = { 'cmd': cmd };
		args.forEach((arg, i) => obj[`arg${i}`] = arg)
		this.socket.send(JSON.stringify(obj))
	}

	reset() {
		this.state = {
			connected: false,
			role: "host",
			playerScore: 0,
			computerScore: 0,
			gameState: "connecting",
			playerY: 0,
			computerY: 0,
			ballX: 0,
			ballY: 0,
			canvasWidth: 0,
			canvasHeight: 0,
			player: 0,
		};
		return this.state;
	}

	setGameMode(gameMode: gameModesType) {
		this.gameMode = gameMode;
	}

	registerGame() {
		this.sendCmd("register");
	}

	updateGame(data: any) {
		this.state.ballX = parseInt(data.arg0);
		this.state.ballY = parseInt(data.arg1);
		this.state.playerY = parseInt(data.arg2);
		this.state.computerY = parseInt(data.arg3);
		this.state.playerScore = parseInt(data.arg4);
		this.state.computerScore = parseInt(data.arg5);
		this.drawGame();
	}

	startGame() {
		this.overlayStart.style.visibility = "hidden";
		this.handleResize();
		this.overlayStart.style.visibility = "hidden";
		this.sendCmd("ready");
	}

	moveLeftPaddle(deltaY: number) {
		if (this.state.player == 1)
			this.sendCmd("paddle", "player", deltaY);
	}

	moveRightPaddle(deltaY: number) {
		if (this.state.player == 2)
			this.sendCmd("paddle", "computer", deltaY);
	}

	restartGame() {
		this.overlayScore.style.visibility = "hidden";
		this.overlayRegister.style.visibility = "visible";
	}

	// updateComputer() {
	// 	if (this.gameMode === 'ai') { // Utilisation de this.gameMode
	// 		const computerCenter = this.state.computerY + PADDLE_HEIGHT / 2;
	//
	// 		if (this.state.ballSpeedX > 0) {
	// 			if (computerCenter < this.state.ballY - 35)
	// 				this.state.computerY += 6;
	// 			else if (computerCenter > this.state.ballY + 35)
	// 				this.state.computerY -= 6;
	// 		} else {
	// 			if (computerCenter < this.state.canvasHeight / 2 - 30)
	// 				this.state.computerY += 3;
	// 			else if (computerCenter > this.state.canvasHeight / 2 + 30)
	// 				this.state.computerY -= 3;
	// 		}
	//
	// 		this.state.computerY = Math.max(this.state.computerY, 0);
	// 		this.state.computerY = Math.min(this.state.computerY, this.state.canvasHeight - PADDLE_HEIGHT);
	// 	}
	// }

	handleResize() {
		const container = this.canvasElement.parentElement;
		if (!container) return;


		this.canvasElement.width = container.clientWidth;
		this.canvasElement.height = container.clientHeight;

		this.state.canvasWidth = this.canvasElement.width;
		this.state.canvasHeight = this.canvasElement.height;

		this.drawGame();
		this.sendCmd("canvas", container.clientWidth, container.clientHeight);
	}

	drawGame() {
		const ctx = this.canvasElement.getContext("2d");
		if (!ctx) return;

		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, this.state.canvasWidth, this.state.canvasHeight);

		ctx.strokeStyle = "#00ff00";
		ctx.setLineDash([10, 15]);
		ctx.beginPath();
		ctx.moveTo(this.state.canvasWidth / 2, 0);
		ctx.lineTo(this.state.canvasWidth / 2, this.state.canvasHeight);
		ctx.stroke();
		ctx.setLineDash([]);

		ctx.fillStyle = "#00ff00";
		ctx.fillRect(0, this.state.playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
		ctx.fillRect(this.state.canvasWidth - PADDLE_WIDTH, this.state.computerY, PADDLE_WIDTH, PADDLE_HEIGHT);

		ctx.beginPath();
		ctx.arc(this.state.ballX, this.state.ballY, BALL_RADIUS, 0, Math.PI * 2);
		ctx.fill();

		ctx.font = "30px monospace";
		ctx.textAlign = "center";
		ctx.fillText(this.state.playerScore.toString(), this.state.canvasWidth / 4, 50);
		ctx.fillText(this.state.computerScore.toString(), (this.state.canvasWidth * 3) / 4, 50);
	}

	render() {
		return div({ className: "relative w-full", style: { height: "60vh" } },
			this.canvasElement,
			this.overlayStart,
			this.overlayScore,
			this.overlayRegister,
			this.overlayError,
		);
	}
}
