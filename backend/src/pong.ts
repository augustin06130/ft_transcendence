import { FastifyRequest } from 'fastify';
import { WebSocket } from '@fastify/websocket';

type GameModeType = 'ai' | 'local' | 'remote';
const gameModes: GameModeType[] = ['ai', 'local', 'remote'];

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
    mode: GameModeType;
    ballAngle: number;
    ballSpeed: number;
};

const WINNING_SCORE = 30;

type Client = {
    username: string;
    socket: WebSocket | null;
    registered: boolean;
};

const aiClient: Client = {
    username: 'computer',
    socket: null,
    registered: false,
};

const guestClient: Client = {
    username: 'guest',
    socket: null,
    registered: false,
};

const p2Client: Client = {
    username: 'player2',
    socket: null,
    registered: false,
};

let player1: Client | null, player2: Client | null;
let clients: Client[] = [];
let dir = 0;
let gameState: PongState = {
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
    mode: 'ai',
    playerSpeed: 6,
    computerSpeed: 6,
    paddleWidth: 10,
};

export default function playPong(socket: WebSocket, request: FastifyRequest) {
    let username: string;
    if (request.session.username) username = request.session.username;
    else username = Math.floor(Math.random() * 1000000000).toString();

    // if (username === "") {
    //   sendCmd(socket, "error", "You must be logged to play !");
    //   socket.close();
    //   return;
    // }

    const currClient = { username, socket, registered: false };
    clients.push(currClient);
    broadcastPlayers();
    broadcastPosition();
    sendCmd(currClient, 'ingame', +gameState.ingame);

    socket.on('message', (message: any) => onMessageHandle(message));

    socket.on('close', () => {
        console.log(`User ${username} left`);
        clients = clients.filter((c: Client) => c.username !== username);
        broadcastPosition();
    });

    /************************************************/
    /*                   Functions                  */
    /************************************************/

    function parse(cmd: string, ...args: (string | number)[]) {
        let obj: any = { cmd: cmd };
        args.forEach((arg, i) => (obj[`arg${i}`] = arg));
        return JSON.stringify(obj);
    }

    function sendCmd(client: Client, cmd: string, ...args: (string | number)[]) {
        if (client.socket) client.socket.send(parse(cmd, ...args));
    }

    function broadcastCmd(cmd: string, ...args: (string | number)[]) {
        let obj = parse(cmd, ...args);
        clients.forEach((client: Client) => {
            if (client.socket && client.socket.readyState === 1) client.socket.send(obj);
        });
    }

    function broadcastPosition() {
        let obj: any = { cmd: 'queuePosition', arg1: getPlayerCount() };
        let i = 1;
        clients.forEach((client: Client) => {
            if (client.registered) obj['arg0'] = i++;
            if (client.socket && client.socket.readyState === 1)
                client.socket.send(JSON.stringify(obj));
        });
    }

    function onMessageHandle(msg: any) {
        const data: Cmd = JSON.parse(msg);
        if (data.cmd !== 'paddle') console.log(data);
        switch (data.cmd) {
            case 'register':
                registerClient();
                break;
            case 'paddle':
                if (data.arg0 === 'player') updatePlayerPaddle(parseInt(data.arg1));
                else updateComputerPaddle(parseInt(data.arg1));
                break;
            case 'ready':
                startGame();
                break;
            case 'mode':
                if (currClient.registered && currClient === player1)
                    gameState.mode = gameModes[(gameModes.indexOf(gameState.mode) + 1) % 3];
                broadcastPlayers();
                break;
        }
    }

    function registerClient() {
        console.log('registering', username);
        clients.map(c => {
            if (c.username === username) {
                c.registered = true;
                sendCmd(c, 'registered');
            }
        });
        broadcastPlayers();
        broadcastPosition();
    }

    function getPlayerCount() {
        return clients.reduce((tot, c) => tot + +c.registered, 0);
    }

    function get2Players() {
        let p1: Client | null = null;
        let p2: Client | null = null;
        clients.forEach((c: Client) => {
            if (c.registered && !p1) p1 = c;
            else if (c.registered && !p2) p2 = c;
        });
        return [p1, p2];
    }

    function broadcastPlayers() {
        [player1, player2] = get2Players();
        if (!player2) player2 = p2Client;
        switch (gameState.mode) {
            case 'local':
                player2 = guestClient;
                break;
            case 'ai':
                player2 = aiClient;
                break;
        }
        if (player1 && player2) {
            clients.forEach(c => {
                if (c === player1) sendCmd(player1, 'role', 'player1');
                else if (c === player2) sendCmd(player2, 'role', 'player2');
                else sendCmd(c, 'role', 'spec');
            });
            broadcastCmd(
                'setNames',
                gameState.mode,
                (player1 as Client).username,
                (player2 as Client).username
            );
        }
    }

    function startGame() {
        if (player2 === p2Client) return;
        if (gameState.ingame) {
            console.log('already in game');
            return;
        }
        gameState.ingame = true;
        broadcastCmd('ingame', 1);
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
        gameState.ballAngle = (Math.PI * (2 * Math.random() - 1)) / 4;
        if (dir++ % 2) gameState.ballAngle = (gameState.ballAngle + Math.PI) % (2 * Math.PI);
        gameState.ballAngle = Math.PI;
        gameState.ballSpeed = 2;

        broadcastGame();
        setTimeout(() => {
            gameState.intervalId = setInterval(updateGame, 5) as any;
        }, 1000);
    }

    function initGame() {
        gameState.playerScore = 0;
        gameState.computerScore = 0;
        gameState.playerY = 0;
        gameState.computerY = 0;
    }

    function updateGame() {
        gameState.ballX += gameState.ballSpeed * Math.cos(gameState.ballAngle);
        gameState.ballY += -gameState.ballSpeed * Math.sin(gameState.ballAngle);

        if (gameState.ballY < gameState.ballRadius || gameState.ballY > 1000 - gameState.ballRadius)
            gameState.ballAngle += 2 * (Math.PI - gameState.ballAngle);
        playerPaddle();
        computerPaddle();

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
            gameState.ballX < gameState.paddleWidth + gameState.ballRadius &&
            gameState.ballY > gameState.playerY &&
            gameState.ballY < gameState.playerY + gameState.playerHeight
        ) {
            const pos = (gameState.ballY - gameState.playerY) / gameState.playerHeight;
            gameState.ballAngle = ((Math.PI * (1 - 2 * pos)) / 4) % (2 * Math.PI);
            gameState.ballSpeed += 0.2;
        }
    }

    function computerPaddle() {
        if (
            gameState.ballX > 1000 - gameState.paddleWidth - gameState.ballRadius &&
            gameState.ballY > gameState.computerY &&
            gameState.ballY < gameState.computerY + gameState.computerHeight
        ) {
            const pos = (gameState.ballY - gameState.computerY) / gameState.computerHeight;
            gameState.ballAngle = ((Math.PI * (2 * pos + 3)) / 4) % (2 * Math.PI);
            gameState.ballSpeed += 0.2;
        }
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

    function checkWinner() {
        if (gameState.playerScore < WINNING_SCORE && gameState.computerScore < WINNING_SCORE)
            return false;
        broadcastGame();
        broadcastCmd(
            'score',
            gameState.playerScore >= WINNING_SCORE
                ? (player1 as Client).username
                : (player2 as Client).username
        );
        gameState.ingame = false;
        broadcastCmd('ingame', 0);
        clients.forEach(c => (c.registered = false));
        broadcastPosition();
        clients.push(clients.splice(clients.indexOf(player1 as Client), 1)[0]);
        if (player2?.socket) clients.push(clients.splice(clients.indexOf(player2 as Client), 1)[0]);
        return true;
    }

    function broadcastGame() {
        broadcastCmd(
            'update',
            gameState.ballX, // 0
            gameState.ballY, // 1
            gameState.playerY, // 2
            gameState.computerY, // 3
            gameState.playerScore, // 4
            gameState.computerScore, // 5
            gameState.playerHeight, // 6
            gameState.computerHeight, // 7
            gameState.ballRadius, // 8
            gameState.paddleWidth // 9
        );
    }
}
