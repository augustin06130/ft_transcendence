import { canvas, div, h2, p, button } from "@framework/tags";
import { Setter, UseStateType } from "@framework/UseState";

export const WINNING_SCORE = 1;

export type GameModeType = 'ai' | 'local' | 'remote';
export const gameModes: GameModeType[] = ['ai', 'local', 'remote'];

type PongState = {
	connected: false;
	playerY: number;
	computerY: number;
	ballX: number;
	ballY: number;
	canvasWidth: number;
	canvasHeight: number;
	playerScore: number;
	computerScore: number;
	player: number;
	deltaYplayer: number;
	deltaYcomputer: number;
	playerHeight: number,
	computerHeight: number,
	ballRadius: number,
	paddleWidth: number,
	ingame: boolean,
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
	gameMode: UseStateType<GameModeType>;
	name1Set: Setter<string>;
	name2Set: Setter<string>;
	topTextSet: Setter<string>;
	socket: WebSocket;

	constructor(gameMode: UseStateType<GameModeType>, name1Set: Setter<string>, name2Set: Setter<string>, topTextSet: Setter<string>) {
		this.name1Set = name1Set;
		this.name2Set = name2Set;
		this.topTextSet = topTextSet;
		this.gameMode = gameMode;
		this.handleResize = this.handleResize.bind(this);
		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.handleKeyUp = this.handleKeyUp.bind(this);
		this.registerGame = this.registerGame.bind(this);
		this.backToRegister = this.backToRegister.bind(this);
		this.messageHanle = this.messageHanle.bind(this);
		this.canvasElement = canvas({ className: "w-full h-full border border-green-500/30 rounded" });
		window.addEventListener("resize", this.handleResize);
		window.addEventListener('keydown', this.handleKeyDown);
		window.addEventListener('keyup', this.handleKeyUp);

		this.state = this.reset();

		this.overlayStart = overlay({
			title: "TERMINAL PONG",
			message: `First to ${WINNING_SCORE} wins`,
			labelName: "READY",
			onclick: () => this.sendCmd("ready")
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
			onclick: this.backToRegister
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

		this.socket.onopen = () => console.log("pong socket opened");

		this.socket.onmessage = (event) => this.messageHanle(event);
		this.socket.onerror = (err) => console.error("Socket error:", err);
		this.socket.onclose = () => this.displayError("You got disconnected");
	}

	messageHanle(msg: MessageEvent) {
		const data = JSON.parse(msg.data);
		if (data.cmd != "update")
			console.log("ws data:", data);
		switch (data.cmd) {
			case "registered":
				this.overlayRegister.style.visibility = "hidden";
				this.overlayStart.style.visibility = "visible";
				break;
			case "set":
				this.state.player = data.arg0;
				this.overlayStart.style.visibility = "hidden";
				break;
			case "go":
				this.overlayStart.style.visibility = "hidden";
				break;
			case "update":
				this.updateGame(data);
				break;
			case "setName":
				this.setName(data);
				break;
			case "score":
				this.overlayScore.children[0].innerHTML = `${data.arg0} WON !`
				this.overlayScore.children[1].innerHTML = `score ${this.state.playerScore} - ${this.state.computerScore}`;
				this.overlayScore.style.visibility = "visible";
				break;
			case "error":
				this.displayError(data.arg0)
			case "spec":
				this.startSpec();
			case "mode":
				this.gameMode.set(data.arg0);
			case "ingame":
				this.state.ingame = !!parseInt(data.arg0);
				console.log("set ingame", this.state.ingame);
				break;
		}
	}

	getIngame(): boolean {
		console.log("get ingame", this.state.ingame);
		return this.state.ingame;
	}

	setName(data: any) {
		this.handleResize();

		if (data.arg0 === "player1") {
			this.name1Set(data.arg1);
			if (this.state.player === 1)
				this.topTextSet(`⬅ ⬅ You are playing as ${data.arg1} ⬅ ⬅`);
		}
		else if (data.arg0 === "player2") {
			this.name2Set(data.arg1);
			if (this.state.player === 2)
				this.topTextSet(`=> => You are playing as ${data.arg1} => =>`);
		}
		if (this.state.player === 3)
			this.topTextSet(`<=> <=> You are playing localy <=> <=>`);

	}

	startSpec() {
		// this.state.ingame = true;
		this.handleResize();
		this.topTextSet("Spectator");
		this.state.player = 3;
		this.overlayScore.style.visibility = "hidden";
		this.overlayRegister.style.visibility = "hidden";
		this.overlayStart.style.visibility = "hidden";
		this.overlayError.style.visibility = "hidden";
	}

	displayError(msg: string) {
		this.overlayRegister.style.visibility = "hidden";
		this.overlayStart.style.visibility = "hidden";
		this.overlayScore.style.visibility = "hidden";
		this.overlayError.style.visibility = "visible";
		this.overlayError.children[1].innerHTML = msg;
	}

	sendCmd(cmd: string, ...args: (string | number)[]) {
		let obj: any = { 'cmd': cmd };
		args.forEach((arg, i) => obj[`arg${i}`] = arg)
		this.socket.send(JSON.stringify(obj))
	}

	reset() {
		this.state = {
			ingame: false,
			connected: false,
			playerScore: 0,
			computerScore: 0,
			playerY: 0,
			computerY: 0,
			deltaYplayer: 0,
			deltaYcomputer: 0,
			ballX: 0,
			ballY: 0,
			canvasWidth: 0,
			canvasHeight: 0,
			player: 0,
			playerHeight: 0,
			computerHeight: 0,
			ballRadius: 0,
			paddleWidth: 0,
		};
		return this.state;
	}

	// setGameMode(gameMode: GameModeType) {
	// 	this.gameMode.set(gameMode);
	// }

	registerGame() {
		this.sendCmd("register");
	}

	updateGame(data: any) {
		// this.state.ingame = true;
		this.state.ballX = parseInt(data.arg0) / 1000 * this.state.canvasWidth;
		this.state.ballY = parseInt(data.arg1) / 1000 * this.state.canvasHeight;
		this.state.playerY = parseInt(data.arg2) / 1000 * this.state.canvasHeight;
		this.state.computerY = parseInt(data.arg3) / 1000 * this.state.canvasHeight;
		this.state.playerScore = parseInt(data.arg4);
		this.state.computerScore = parseInt(data.arg5);
		this.state.playerHeight = parseInt(data.arg6) / 1000 * this.state.canvasHeight;
		this.state.computerHeight = parseInt(data.arg7) / 1000 * this.state.canvasHeight;
		this.state.ballRadius = parseInt(data.arg8) / 1000 * this.state.canvasHeight;
		this.state.paddleWidth = parseInt(data.arg9) / 1000 * this.state.canvasWidth


		this.drawGame();
		this.moveLeftPaddle();
		this.moveRightPaddle();
	}

	moveLeftPaddle() {
		if (this.state.player === 1 || this.gameMode.get() === 'local')
			this.sendCmd("paddle", "player", this.state.deltaYplayer);
	}

	moveRightPaddle() {
		if (this.state.player === 2 || this.gameMode.get() === 'local')
			this.sendCmd("paddle", "computer", this.state.deltaYcomputer);
	}

	handleKeyDown(e: KeyboardEvent) {
		console
		if (e.key === 'w' || e.key === 'W')
			this.state.deltaYplayer = -1;
		else if (e.key === 's' || e.key === 'S')
			this.state.deltaYplayer = 1;
		if (e.key === 'i' || e.key === 'I')
			this.state.deltaYcomputer = -1;
		else if (e.key === 'k' || e.key === 'K')
			this.state.deltaYcomputer = 1;
	};

	handleKeyUp(e: KeyboardEvent) {
		if (e.key === 'w' || e.key === 'W' || e.key === 's' || e.key === 'S')
			this.state.deltaYplayer = 0;
		if (e.key === 'i' || e.key === 'I' || e.key === 'k' || e.key === 'K')
			this.state.deltaYcomputer = 0;
	}

	backToRegister() {
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

		// this.sendCmd("canvas", this.state.canvasWidth, this.state.canvasHeight);
		this.drawGame();
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
		ctx.fillRect(0, this.state.playerY, this.state.paddleWidth, this.state.playerHeight);
		ctx.fillRect(this.state.canvasWidth - this.state.paddleWidth, this.state.computerY, this.state.paddleWidth, this.state.computerHeight);

		ctx.beginPath();
		ctx.arc(this.state.ballX, this.state.ballY, this.state.ballRadius, 0, Math.PI * 2);
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
