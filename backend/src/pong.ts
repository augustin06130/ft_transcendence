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
  canvasWidth: number;
  canvasHeight: number;
  playerScore: number;
  computerScore: number;
  winner: string;
  ballRadius: number;
  intervalId: number;
  mode: "ai" | "local" | "remote";
};

const PADDLE_WIDTH = 10;
const WINNING_SCORE = 3;

// let connects = new Set<string>();
type client = {
  username: string;
  socket: WebSocket;
  registered: boolean;
};

let clients: client[] = [];

let gameState: PongState = {
  ingame: false,
  ballX: 0,
  ballY: 0,
  ballSpeedX: 0,
  ballSpeedY: 0,
  playerY: 0,
  computerY: 0,
  playerHeight: 100,
  computerHeight: 100,
  playerScore: 0,
  computerScore: 0,
  canvasWidth: 0,
  canvasHeight: 0,
  winner: "",
  ballRadius: 8,
  intervalId: 0,
  mode: "ai",
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
  clients.push;
  clients.push({ username, socket, registered: true });

  socket.on("message", (message: any) => onMessageHandle(message, username));

  socket.on("close", () => {
    console.log(`User ${username} left`);
    clients.filter((c: client) => c.username === username);
  });

  function parse(cmd: string, ...args: (string | number)[]) {
    let obj: any = { cmd: cmd };
    args.forEach((arg, i) => (obj[`arg${i}`] = arg));
    return JSON.stringify(obj);
  }

  function sendCmd(client: client, cmd: string, ...args: (string | number)[]) {
    client.socket.send(parse(cmd, ...args));
  }

  function broadcastCmd(cmd: string, ...args: (string | number)[]) {
    let obj = parse(cmd, ...args);

    clients.forEach((client: client) => {
      if (client.socket.readyState === 1) client.socket.send(obj);
    });
  }

  function onMessageHandle(msg: any, username: string) {
    const data = JSON.parse(msg);
    console.log(data);
    switch (data.cmd) {
      case "register":
        clients.map((c) => {
          if (c.username === username) {
            c.registered = true;
            sendCmd(c, "registered");
          }
        });
        break;
      case "canvas":
        gameState.canvasWidth = data.arg0;
        gameState.canvasHeight = data.arg1;
        break;
      case "paddle":
        if (data.arg0 === "player") updatePlayerPaddle(data.arg1);
        else updateComputerPaddle(data.arg1);
        break;
      case "ready":
        if (!gameState.ingame) startGame();
        break;
      case "error":
        break;
    }
  }

  function getPlayer() {
    let i = clients.findIndex((c) => c.registered);
    return clients[i];
  }

  function startGame() {
    gameState.ingame = true;

    //selecting players
    let p1 = getPlayer();
    let p2 = getPlayer();
    broadcastCmd("setName", "player1", p1.username);
    broadcastCmd("setName", "player2", p2.username);

    broadcastCmd("set", 3);
    sendCmd(p1, "set", 1);
	if (p1 !== p2)
    	sendCmd(p2, "set", 2);

    initGame();
    startTurn();
  }

  function startTurn() {
    if (gameState.intervalId) clearInterval(gameState.intervalId);

    if (checkWinner()) return;

    gameState.playerY = (gameState.canvasHeight - gameState.playerHeight) / 2;
    gameState.computerY =
      (gameState.canvasHeight - gameState.computerHeight) / 2;
    gameState.ballX = gameState.canvasWidth / 2;
    gameState.ballY = gameState.canvasHeight / 2;
    gameState.ballSpeedX = -4 / 10;
    gameState.ballSpeedY = (Math.random() * 4 - 2) / 10;
    gameState.ballRadius = 8;
    BroadcastGame();
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
    BroadcastGame();
    broadcastCmd(
      "score",
      gameState.playerScore >= WINNING_SCORE ? "player" : "computer",
    );
    gameState.ingame = false;
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
    gameState.playerY = Math.min(
      gameState.playerY,
      gameState.canvasHeight - gameState.playerHeight,
    );
  }

  function updateComputerPaddle(delta: number) {
    gameState.computerY += delta;
    gameState.computerY = Math.max(gameState.computerY, 0);
    gameState.computerY = Math.min(
      gameState.computerY,
      gameState.canvasHeight - gameState.computerHeight,
    );
  }

  function updateGame() {
    gameState.ballX += gameState.ballSpeedX;
    gameState.ballY += gameState.ballSpeedY;

    // Top and bottom collisions
    if (
      gameState.ballY < gameState.ballRadius ||
      gameState.ballY > gameState.canvasHeight - gameState.ballRadius
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
    if (gameState.ballX > gameState.canvasWidth - gameState.ballRadius) {
      gameState.playerScore++;
      startTurn();
    }
    BroadcastGame();
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
        gameState.canvasWidth - PADDLE_WIDTH - gameState.ballRadius &&
      gameState.ballY > gameState.computerY &&
      gameState.ballY < gameState.computerY + gameState.computerHeight
    ) {
      gameState.ballSpeedX = -gameState.ballSpeedX;

      const deltaY =
        gameState.ballY - (gameState.computerY + gameState.computerHeight / 2);
      gameState.ballSpeedY = deltaY * 0.35;
    }
  }
  function ai() {}

  function BroadcastGame() {
    broadcastCmd(
      "update",
      gameState.ballX,
      gameState.ballY,
      gameState.playerY,
      gameState.computerY,
      gameState.playerScore,
      gameState.computerScore,
    );
  }
}
