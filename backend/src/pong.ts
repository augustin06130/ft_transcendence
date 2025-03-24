import { FastifyInstance, FastifyRequest } from "fastify";
import { WebSocket } from "@fastify/websocket";

type PongState = {
	ingame: boolean;
	ballX: number;
	ballY: number;
	playerY: number;
	computerY: number;
	playerHeight: number;
	computerHeight: number;
	ballSpeedX: number;
	ballSpeedY: number;
	playerScore: number;
	computerScore: number;
	ballRadius: number;
	intervalId: number;
	playerSpeed: number;
	computerSpeed: number;
	mode: "ai" | "local" | "remote";
};

const PADDLE_WIDTH = 10;
const WINNING_SCORE = 1;

// let connects = new Set<string>();
type Client = {
	username: string;
	socket: WebSocket;
	registered: boolean;
};

let clients: Client[] = [];

let gameState: PongState = {
	ingame: false,
	ballX: 0,
	ballY: 0,
	ballSpeedX: 0,
	ballSpeedY: 0,
	playerY: 0,
	computerY: 0,
	playerHeight: 200,
	computerHeight: 200,
	playerScore: 0,
	computerScore: 0,
	ballRadius: 12,
	intervalId: 0,
	mode: "ai",
	playerSpeed: 6,
	computerSpeed: 6,
};

export default function playPong(
	socket: WebSocket,
	request: FastifyRequest,
	app: FastifyInstance,
) {
	const username = Math.floor(Math.random() * 1000000000).toString();
	// const username = request.session.username ? request.session.username : "";

	// if (username === "") {
	//   sendCmd(socket, "error", "You must be logged to play !");
	//   socket.close();
	//   return;
	// }

	console.log(`User: ${username} arrived`);
	let currClient = { username, socket, registered: true };
	clients.push(currClient);
	if (gameState.ingame) {
		console.log("go to sec");
		sendCmd(currClient, "spec");
	}

	socket.on("message", (message: any) => onMessageHandle(message));

	socket.on("close", () => {
		console.log(`User ${username} left`);
		clients.filter((c: Client) => c.username === username);
	});

	function parse(cmd: string, ...args: (string | number)[]) {
		let obj: any = { cmd: cmd };
		args.forEach((arg, i) => (obj[`arg${i}`] = arg));
		return JSON.stringify(obj);
	}

	function sendCmd(client: Client, cmd: string, ...args: (string | number)[]) {
		client.socket.send(parse(cmd, ...args));
	}

	function broadcastCmd(cmd: string, ...args: (string | number)[]) {
		let obj = parse(cmd, ...args);
		clients.forEach((client: Client) => {
			if (client.socket.readyState === 1) client.socket.send(obj);
		});
	}

	function onMessageHandle(msg: any) {
		const data = JSON.parse(msg);
		if (data.cmd !== "paddle")
			console.log(data);
		switch (data.cmd) {
			case "register":
				registerClient();
				break;
			case "paddle":
				if (data.arg0 === "player")
					updatePlayerPaddle(data.arg1);
				else
					updateComputerPaddle(data.arg1);
				break;
			case "ready":
				startGame();
				break;
			case "mode":
				gameState.mode = data.arg0;
				broadcastCmd("mode", data.arg0);
				break;
		}
	}
	
	function registerClient() {
		clients.map((c) => {
			if (c.username === username) {
				c.registered = true;
				sendCmd(c, "registered");
			}
		});
	}

	function getPlayer() {
		const c = clients.slice(clients.findIndex((c) => c.registered))[0];
		clients.push(c);
		return c;
	}

	function getPlayerCount() {
		return clients.reduce((tot, c) => tot + +c.registered, 0);
	}

	function selectPlayers(): boolean {
		if (gameState.mode === "remote" && getPlayerCount() < 2)
			return false;

		let p2 = null;
		const p1 = getPlayer();
		sendCmd(p1, "set", 1);
		broadcastCmd("setName", "player1", p1.username);

		switch (gameState.mode) {
			case "remote":
				console.log("number of players", getPlayerCount());
				p2 = getPlayer();
				sendCmd(p2, "set", 2);
				broadcastCmd("setName", "player2", p2.username);
				break;
			case "ai":
				broadcastCmd("setName", "player2", 'Computer');
				break;
			case "local":
				broadcastCmd("setName", "player2", 'Guest');
				break;
		}

		clients.forEach(c => {
			if (c != p1 && c != p2)
				sendCmd(c, "spec");
		})

		return true;
	}

	function startGame() {
		if (gameState.ingame) {
			console.log("already in game")
			return;
		}
		if (!selectPlayers()) {
			console.log("cannot start")
			return;
		}

		gameState.ingame = true;
		broadcastCmd("ingame", 1);
		initGame();
		startTurn();
	}

	function startTurn() {
		if (gameState.intervalId) clearInterval(gameState.intervalId);

		if (checkWinner()) return;

		gameState.playerY = 500;
		gameState.computerY = 500;
		gameState.ballX = 500;
		gameState.ballY = 500;
		gameState.ballSpeedX = -2;
		gameState.ballSpeedY = Math.random() * 2;

		broadcastGame();
		setTimeout(() => {
			gameState.intervalId = setInterval(updateGame, 10) as any;
		}, 1000);
	}

	function checkWinner() {
		if (
			gameState.playerScore < WINNING_SCORE &&
			gameState.computerScore < WINNING_SCORE
		)
			return false;
		broadcastGame();
		broadcastCmd("score", gameState.playerScore >= WINNING_SCORE ? "player" : "computer");
		gameState.ingame = false;
		broadcastCmd("ingame", 0);
		return true;
	}

	function initGame() {
		gameState.playerScore = 0;
		gameState.computerScore = 0;
		gameState.playerY = 0;
		gameState.computerY = 0;
	}

	function updatePlayerPaddle(delta: number) {
		gameState.playerY += delta * gameState.playerSpeed;
		gameState.playerY = Math.max(gameState.playerY, 0);
		gameState.playerY = Math.min(gameState.playerY, 1000 - gameState.playerHeight);
	}

	function updateComputerPaddle(delta: number) {
		gameState.computerY += delta * gameState.computerSpeed;
		gameState.computerY = Math.max(gameState.computerY, 0);
		gameState.computerY = Math.min(gameState.computerY, 1000 - gameState.computerHeight);
	}

	function updateGame() {
		gameState.ballX += gameState.ballSpeedX;
		gameState.ballY += gameState.ballSpeedY;

		// Top and bottom collisions
		if (
			gameState.ballY < gameState.ballRadius ||
			gameState.ballY > 1000 - gameState.ballRadius
		)
			gameState.ballSpeedY = -gameState.ballSpeedY;

		// Paddles bounce collisions
		playerPaddle();
		computerPaddle();

		// Left and right exit
		if (gameState.ballX < gameState.ballRadius) {
			gameState.computerScore++;
			startTurn();
		}
		if (gameState.ballX > 1000 - gameState.ballRadius) {
			gameState.playerScore++;
			startTurn();
		}
		broadcastGame();
	}

	function playerPaddle() {
		if (
			gameState.ballX < PADDLE_WIDTH + gameState.ballRadius &&
			gameState.ballY > gameState.playerY &&
			gameState.ballY < gameState.playerY + gameState.playerHeight
		) {
			gameState.ballSpeedX = -gameState.ballSpeedX;

			const deltaY =
				gameState.ballY - (gameState.playerY + gameState.playerHeight / 2);
			gameState.ballSpeedY = deltaY * 0.35;
		}
	}

	function computerPaddle() {
		if (
			gameState.ballX >
			1000 - PADDLE_WIDTH - gameState.ballRadius &&
			gameState.ballY > gameState.computerY &&
			gameState.ballY < gameState.computerY + gameState.computerHeight
		) {
			gameState.ballSpeedX = -gameState.ballSpeedX;

			const deltaY =
				gameState.ballY - (gameState.computerY + gameState.computerHeight / 2);
			gameState.ballSpeedY = deltaY * 0.35;
		}
	}
	function ai() { }

	function broadcastGame() {
		broadcastCmd(
			"update",
			gameState.ballX,			// 0
			gameState.ballY,			// 1
			gameState.playerY,			// 2
			gameState.computerY,		// 3
			gameState.playerScore,		// 4
			gameState.computerScore,	// 5
			gameState.playerHeight,		// 6
			gameState.computerHeight,	// 7
			gameState.ballRadius,		// 8
			PADDLE_WIDTH,				// 9
		);
	}
}
