import { FastifyInstance, FastifyRequest } from 'fastify';
import { WebSocket } from '@fastify/websocket';

const PADDLE_WIDTH = 10;
const WINNING_SCORE = 3;

let connects = new Set();
let players = new Set();
let gameState: PongState = {
	'ballX': 0,
	'ballY': 0,
	'ballSpeedX': 0,
	'ballSpeedY': 0,
	'playerY': 0,
	'computerY': 0,
	'playerHeight': 100,
	'computerHeight': 100,
	'playerScore': 0,
	'computerScore': 0,
	'canvasWidth': 0,
	'canvasHeight': 0,
	'winner': "",
	'ballRadius': 8,
	'intervalId': 0,
};

type PongState = {
	ballX: number;
	ballY: number;
	playerY: number;
	computerY: number;
	playerHeight: number;
	computerHeight: number;
	ballSpeedX: number;
	ballSpeedY: number;
	canvasWidth: number;
	canvasHeight: number;
	playerScore: number;
	computerScore: number;
	winner: string;
	ballRadius: number;
	intervalId: number;
}

export default function playPong(socket: WebSocket, request: FastifyRequest, app: FastifyInstance) {
	const username = request.session.username ? request.session.username : "";

	if (username === "") {
		sendCmd("error", "username not found")
		socket.close();
		return;
	}

	if (connects.has(username)) {
		sendCmd("error", "duplicate connection")
		socket.close();
		return
	}

	console.log(`User: ${request.session.username} arrived`);
	connects.add(username)

	socket.on('message', (message: any) => onMessageHandle(message, username))

	socket.on('close', () => {
		console.log(`User ${request.session.username} left`);
		connects.delete(username);
		players.delete(username);
	})

	function sendCmd(cmd: string, ...args: (string | number)[]) {
		let obj: any = { 'cmd': cmd };
		args.forEach((arg, i) => obj[`arg${i}`] = arg)
		socket.send(JSON.stringify(obj))
	}

	function onMessageHandle(msg: any, username: string) {
		const data = JSON.parse(msg)
		console.log(data);
		switch (data.cmd) {
			case "register":
				players.add(username)
				sendCmd("registered")
				break;
			case "canvas":
				gameState.canvasWidth = data.arg0;
				gameState.canvasHeight = data.arg1;
				break;
			case "paddle":
				if (data.arg0 == "player")
					updatePlayerPaddle(data.arg1)
				else
					updateComputerPaddle(data.arg1)
				break;
			case "ready":
				sendCmd("set", 1);
				initGame();
				startTurn();
				break;
			case "error":
				break;
		}
	}

	function startTurn() {
		if (gameState.intervalId)
			clearInterval(gameState.intervalId)

		if (checkWinner())
			return;

		gameState.playerY = (gameState.canvasHeight - gameState.playerHeight) / 2;
		gameState.computerY = (gameState.canvasHeight - gameState.computerHeight) / 2;
		gameState.ballX = gameState.canvasWidth / 2;
		gameState.ballY = gameState.canvasHeight / 2;
		gameState.ballSpeedX = -4;
		gameState.ballSpeedY = Math.random() * 4 - 2;
		gameState.ballRadius = 8;
		sendGame();
		setTimeout(() => {
			gameState.intervalId = setInterval(updateGame, 10) as any;
		}, 1000);
	}

	function checkWinner() {
		if (gameState.playerScore < WINNING_SCORE && gameState.computerScore < WINNING_SCORE)
			return false;
		sendGame();
		sendCmd("score", gameState.playerScore >= WINNING_SCORE ? "player" : "computer");
		return true;
	}


	function initGame() {
		gameState.playerScore = 0;
		gameState.computerScore = 0;
		gameState.playerY = 0;
		gameState.computerY = 0;
		gameState.winner = "";
	}

	function updatePlayerPaddle(delta: number) {
		gameState.playerY += delta;
		gameState.playerY = Math.max(gameState.playerY, 0);
		gameState.playerY = Math.min(gameState.playerY, gameState.canvasHeight - gameState.playerHeight);
	}

	function updateComputerPaddle(delta: number) {
		gameState.computerY += delta;
		gameState.computerY = Math.max(gameState.computerY, 0);
		gameState.computerY = Math.min(gameState.computerY, gameState.canvasHeight - gameState.computerHeight);
	}

	function updateGame() {

		gameState.ballX += gameState.ballSpeedX;
		gameState.ballY += gameState.ballSpeedY;

		// Top and bottom collisions
		if (gameState.ballY < gameState.ballRadius || gameState.ballY > gameState.canvasHeight - gameState.ballRadius)
			gameState.ballSpeedY = -gameState.ballSpeedY;

		// Paddles bounce collisions
		playerPaddle();
		computerPaddle();

		// Left and right exit
		if (gameState.ballX < gameState.ballRadius) {
			gameState.computerScore++;
			startTurn();
		}
		if (gameState.ballX > gameState.canvasWidth - gameState.ballRadius) {
			gameState.playerScore++;
			startTurn();
		}

		sendGame();
	}

	function playerPaddle() {
		if (
			gameState.ballX < PADDLE_WIDTH + gameState.ballRadius &&
			gameState.ballY > gameState.playerY &&
			gameState.ballY < gameState.playerY + gameState.playerHeight
		) {
			gameState.ballSpeedX = -gameState.ballSpeedX;

			const deltaY = gameState.ballY - (gameState.playerY + gameState.playerHeight / 2);
			gameState.ballSpeedY = deltaY * 0.35;
		}
	}

	function computerPaddle() {
		if (
			gameState.ballX > gameState.canvasWidth - PADDLE_WIDTH - gameState.ballRadius &&
			gameState.ballY > gameState.computerY &&
			gameState.ballY < gameState.computerY + gameState.computerHeight
		) {
			gameState.ballSpeedX = -gameState.ballSpeedX;

			const deltaY = gameState.ballY - (gameState.computerY + gameState.computerHeight / 2);
			gameState.ballSpeedY = deltaY * 0.35;
		}
	}

	function sendGame() {
		sendCmd("update", gameState.ballX, gameState.ballY, gameState.playerY, gameState.computerY, gameState.playerScore, gameState.computerScore);
	}
}


