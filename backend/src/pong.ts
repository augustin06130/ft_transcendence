import { FastifyRequest } from 'fastify';
import { WebSocket } from '@fastify/websocket';
import Tournament, { Match } from './tournament';

const WINNING_SCORE = 3;

// dev only
let idCount: number = 1;
export type GameMode = 'ai' | 'local' | 'remote';
const gameModes: GameMode[] = ['ai', 'local', 'remote'];

type Cmd = {
	cmd: string;
	[key: `arg${number}`]: string;
};

type PongState = {
	ingame: boolean;
	ballX: number;
	ballY: number;
	playerY: number;
	computerY: number;
	playerHeight: number;
	computerHeight: number;
	playerScore: number;
	computerScore: number;
	ballRadius: number;
	intervalId: number;
	playerSpeed: number;
	computerSpeed: number;
	paddleWidth: number;
	ballAngle: number;
	ballSpeed: number;
};

export type Client = {
	username: string;
	socket: WebSocket | null;
};

export default class PongGame {
	private player1: Client | undefined;
	private player2: Client | undefined;
	private clients: Client[] = [];
	public tournament: Tournament = new Tournament;
	private dir: number = 1;
	private kill: () => void;
	private gameState: PongState = {
		ingame: false,
		ballX: 0,
		ballY: 0,
		ballAngle: 0,
		ballSpeed: 0,
		playerY: 0,
		computerY: 0,
		playerHeight: 200,
		computerHeight: 200,
		playerScore: 0,
		computerScore: 0,
		ballRadius: 12,
		intervalId: 0,
		playerSpeed: 6,
		computerSpeed: 6,
		paddleWidth: 10,
	};

	constructor(kill: () => void) {
		this.updateGame = this.updateGame.bind(this);
		this.kill = kill;
	}

	public tournamentTree(): string {
		return this.tournament.stringify().join('\n');
	}

	public joinGame(socket: WebSocket, request: FastifyRequest) {
		let username: string;
		// dev only
		if (request.session.username) {
			username = request.session.username;
		} else {
			username = (idCount++).toString();
		}

		const client = { username, socket };
		this.sendCmd(client, 'username', username);

		this.clients.push(client);
		this.broadcastPosition();
		this.sendCmd(client, 'ingame', +this.gameState.ingame);

		socket.on('message', (message: any) => this.onMessageHandle(message, client));
		socket.on('close', () => this.leaveGame(client));
	}

	private leaveGame(client: Client) {
		console.log(`User ${client.username} left`);
		if (client === this.player2 || client === this.player1) {
			this.broadcastCmd('info', `Player: ${client.username} disconnected`);
			if (this.gameState.ingame)
				this.setWinner(
					(client === this.player1 ? this.player2 : this.player1) as Client
				);
		}
		this.tournament.removePlayer(client);
		this.clients = this.clients.filter((c: Client) => c !== client);
		this.broadcastPosition();
		if (this.clients.length < 1) {
			this.kill();
		}
	}

	private parse(cmd: string, ...args: (string | number)[]) {
		let obj: any = { cmd: cmd };
		args.forEach((arg, i) => (obj[`arg${i}`] = arg));
		return JSON.stringify(obj);
	}

	private sendCmd(client: Client, cmd: string, ...args: (string | number)[]) {
		if (client.socket) client.socket.send(this.parse(cmd, ...args));
	}

	private broadcastCmd(cmd: string, ...args: (string | number)[]) {
		let obj = this.parse(cmd, ...args);
		this.clients.forEach((client: Client) => {
			if (client.socket && client.socket.readyState === 1) client.socket.send(obj);
		});
	}

	private onMessageHandle(msg: string, currClient: Client) {
		const data: Cmd = JSON.parse(msg);
		if (data.cmd !== 'paddle') console.log(data);
		switch (data.cmd) {
			case 'register':
				this.registerHandle(currClient);
				break;
			case 'paddle':
				this.handlePaddle(data);
				break;
			case 'ready':
				this.startGame();
				break;
			case 'mode':
				this.changeModeHanble();
				break;
			case 'next':
				this.broadcastCmd('next');
				break;
		}
	}

	private registerHandle(currClient: Client) {
		this.tournament.addPlayer(currClient);
		this.sendCmd(currClient, 'registered');
		this.broadcastPosition();
	}

	private handlePaddle(data: Cmd) {
		if (data.arg0 === 'player') {
			this.playerPaddlePos(parseInt(data.arg1));
		}
		else {
			this.computerPaddlePos(parseInt(data.arg1));
		}
	}

	private startGame() {

		if (!this.player1?.socket) {
			return this.broadcastCmd('info', 'not enough player is the room')
		}
		if (this.gameState.ingame) {
			return console.log('already in game');
		}
		this.gameState.ingame = true;
		this.broadcastCmd('ingame', 1);
		this.gameState.playerScore = 0;
		this.gameState.computerScore = 0;
		this.startTurn();
	}

	private changeModeHanble() {
		this.tournament.mode =
			gameModes[(gameModes.indexOf(this.tournament.mode) + 1) % gameModes.length];
		this.broadcastPosition();
	}

	private broadcastPlayers() {
		let matchString;
		let match = this.tournament.nextMatch();
		if (match) {
			this.player1 = match.player1 as Client;
			this.player2 = match.player2 as Client;
			matchString = Tournament.getMatchString(match);
		}
		else {
			matchString = 'Not enough players in the room';
		}

		this.broadcastCmd(
			'setNames',
			this.tournament.mode,
			this.player1?.username || 'Player1',
			this.player2?.username || 'Player2',
			matchString,
		);
	}

	private broadcastPosition() {
		let obj: any = { cmd: 'queuePosition', arg1: this.tournament.players.length };
		let i = 1;
		this.clients.forEach((client: Client) => {
			if (this.tournament.players.includes(client)) {
				obj['arg0'] = i++;
			}
			if (client.socket && client.socket.readyState === 1) {
				client.socket.send(JSON.stringify(obj));
			}
		});
		this.broadcastPlayers();
	}

	private broadcastGame() {
		this.broadcastCmd(
			'update',
			this.gameState.ballX, // 0
			this.gameState.ballY, // 1
			this.gameState.playerY, // 2
			this.gameState.computerY, // 3
			this.gameState.playerScore, // 4
			this.gameState.computerScore, // 5
			this.gameState.playerHeight, // 6
			this.gameState.computerHeight, // 7
			this.gameState.ballRadius, // 8
			this.gameState.paddleWidth // 9
		);
	}

	private startTurn() {
		this.broadcastGame();
		clearInterval(this.gameState.intervalId);
		this.gameState.intervalId = 0;

		if (this.checkWinner()) return;

		this.gameState.playerY = 500 - this.gameState.playerHeight / 2;
		this.gameState.computerY = 500 - this.gameState.computerHeight / 2;
		this.gameState.ballX = 500;
		this.gameState.ballY = 500;
		this.gameState.ballAngle = (Math.PI * (2 * Math.random() - 1)) / 4;
		if (this.dir++ % 2) {
			this.gameState.ballAngle = (this.gameState.ballAngle + Math.PI) % (2 * Math.PI);
		}
		this.gameState.ballSpeed = 2;

		this.broadcastGame();
		setTimeout(() => {
			this.gameState.intervalId = setInterval(this.updateGame, 5) as any;
		}, 1000);
	}

	private updateGame() {
		this.gameState.ballX += this.gameState.ballSpeed * Math.cos(this.gameState.ballAngle);
		this.gameState.ballY += -this.gameState.ballSpeed * Math.sin(this.gameState.ballAngle);

		if (
			this.gameState.ballY < this.gameState.ballRadius ||
			this.gameState.ballY > 1000 - this.gameState.ballRadius
		)
			this.gameState.ballAngle += 2 * (Math.PI - this.gameState.ballAngle);
		this.playerPaddleBounce();
		this.computerPaddleBounce();

		if (this.gameState.ballX < this.gameState.ballRadius / 2) {
			this.gameState.computerScore++;
			this.startTurn();
		}
		if (this.gameState.ballX > 1000 - this.gameState.ballRadius / 2) {
			this.gameState.playerScore++;
			this.startTurn();
		}
		this.broadcastGame();
	}

	private playerPaddleBounce() {
		if (
			this.gameState.ballX < this.gameState.paddleWidth + this.gameState.ballRadius &&
			this.gameState.ballY > this.gameState.playerY &&
			this.gameState.ballY < this.gameState.playerY + this.gameState.playerHeight
		) {
			const pos =
				(this.gameState.ballY - this.gameState.playerY) / this.gameState.playerHeight;
			this.gameState.ballAngle = ((Math.PI * (1 - 2 * pos)) / 4) % (2 * Math.PI);
			this.gameState.ballSpeed += 0.2;
		}
	}

	private computerPaddleBounce() {
		if (
			this.gameState.ballX > 1000 - this.gameState.paddleWidth - this.gameState.ballRadius &&
			this.gameState.ballY > this.gameState.computerY &&
			this.gameState.ballY < this.gameState.computerY + this.gameState.computerHeight
		) {
			const pos =
				(this.gameState.ballY - this.gameState.computerY) / this.gameState.computerHeight;
			this.gameState.ballAngle = ((Math.PI * (2 * pos + 3)) / 4) % (2 * Math.PI);
			this.gameState.ballSpeed += 0.2;
		}
	}

	private playerPaddlePos(delta: number) {
		this.gameState.playerY += delta * this.gameState.playerSpeed;
		this.gameState.playerY = Math.max(this.gameState.playerY, 0);
		this.gameState.playerY = Math.min(
			this.gameState.playerY,
			1000 - this.gameState.playerHeight
		);
	}

	private computerPaddlePos(delta: number) {
		this.gameState.computerY += delta * this.gameState.computerSpeed;
		this.gameState.computerY = Math.max(this.gameState.computerY, 0);
		this.gameState.computerY = Math.min(
			this.gameState.computerY,
			1000 - this.gameState.computerHeight
		);
	}

	private checkWinner() {
		if (
			this.gameState.playerScore < WINNING_SCORE &&
			this.gameState.computerScore < WINNING_SCORE
		)
			return false;
		this.setWinner(
			this.gameState.playerScore >= WINNING_SCORE
				? this.player1 as Client
				: this.player2 as Client
		);
		return true;
	}

	private setWinner(winner: Client) {
		clearInterval(this.gameState.intervalId);
		this.gameState.intervalId = 0;

		if (this.tournament.mode === 'remote') {
			let playedMatch = this.tournament.nextMatch() as Match;
			playedMatch.winner = winner;
		}
		// this.broadcastGame();
		this.broadcastCmd('score', winner.username);
		if (this.tournament.mode === 'remote' && this.tournament.nextMatch()) {
			this.broadcastCmd('ingame', -1);
		}
		else {
			this.tournament = new Tournament;
			this.broadcastCmd('ingame', 0);
		}
		this.gameState.ingame = false;
		this.broadcastPosition();
	}
}
