import { FastifyRequest } from 'fastify';
import { WebSocket } from '@fastify/websocket';

const WINNING_SCORE = 10;

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
    mode: GameMode;
    ballAngle: number;
    ballSpeed: number;
};

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

const p1Client: Client = {
    username: 'player1',
    socket: null,
    registered: false,
};

const p2Client: Client = {
    username: 'player2',
    socket: null,
    registered: false,
};

export default class PongGame {
    private player1: Client = p1Client;
    private player2: Client = p2Client;
    private clients: Client[] = [];
    private dir: number = 1;
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
        mode: 'ai',
        playerSpeed: 6,
        computerSpeed: 6,
        paddleWidth: 10,
    };

    constructor() {
        this.updateGame = this.updateGame.bind(this);
    }

    public joinGame(socket: WebSocket, request: FastifyRequest) {
        let username: string;
        if (request.session.username) {
            username = request.session.username;
        } else {
            username = Math.floor(Math.random() * 1000000000).toString();
        }

        const client = { username, socket, registered: false };
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
                    client === this.player1 ? this.player2?.username : this.player1?.username
                );
        }
        this.clients = this.clients.filter((c: Client) => c.username !== client.username);
        this.broadcastPosition();
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
                if (data.arg0 === 'player') this.updatePlayerPaddle(parseInt(data.arg1));
                else this.updateComputerPaddle(parseInt(data.arg1));
                break;
            case 'ready':
                this.startGame();
                break;
            case 'mode':
                this.changeModeHanble(currClient);
                break;
        }
    }
    private changeModeHanble(currClient: Client) {
        if (currClient.registered && currClient === this.player1)
            this.gameState.mode =
                gameModes[(gameModes.indexOf(this.gameState.mode) + 1) % gameModes.length];
        this.broadcastPosition();
    }

    private registerHandle(currClient: Client) {
        this.clients.map(c => {
            if (c.username === currClient.username) {
                c.registered = true;
                this.sendCmd(c, 'registered');
            }
        });
        this.broadcastPosition();
    }

    private getPlayerCount() {
        return this.clients.reduce((tot, c) => tot + +c.registered, 0);
    }

    private get2Players() {
        let p1: Client | null = null;
        let p2: Client | null = null;
        this.clients.forEach((c: Client) => {
            if (c.registered && !p1) p1 = c;
            else if (c.registered && !p2) p2 = c;
        });
        return [p1 || p1Client, p2 || p2Client];
    }

    private broadcastPlayers() {
        [this.player1, this.player2] = this.get2Players();
        if (!this.player2) this.player2 = p2Client;
        switch (this.gameState.mode) {
            case 'local':
                this.player2 = guestClient;
                break;
            case 'ai':
                this.player2 = aiClient;
                break;
        }
        if (this.player1 && this.player2) {
            this.clients.forEach(c => {
                if (c === this.player1) this.sendCmd(this.player1, 'role', 'player1');
                else if (c === this.player2) this.sendCmd(this.player2, 'role', 'player2');
                else this.sendCmd(c, 'role', 'spec');
            });
            this.broadcastCmd(
                'setNames',
                this.gameState.mode,
                this.player1.username,
                this.player2.username
            );
        }
    }

    private broadcastPosition() {
        let obj: any = { cmd: 'queuePosition', arg1: this.getPlayerCount() };
        let i = 1;
        this.clients.forEach((client: Client) => {
            if (client.registered) obj['arg0'] = i++;
            if (client.socket && client.socket.readyState === 1)
                client.socket.send(JSON.stringify(obj));
        });
        this.broadcastPlayers();
    }

    private startGame() {
        if (this.player2 === p2Client) return;
        if (this.gameState.ingame) {
            console.log('already in game');
            return;
        }
        this.gameState.ingame = true;
        this.broadcastCmd('ingame', 1);
        this.initGame();
        this.startTurn();
    }

    private startTurn() {
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

    private initGame() {
        this.gameState.playerScore = 0;
        this.gameState.computerScore = 0;
    }

    private updateGame() {
        this.gameState.ballX += this.gameState.ballSpeed * Math.cos(this.gameState.ballAngle);
        this.gameState.ballY += -this.gameState.ballSpeed * Math.sin(this.gameState.ballAngle);

        if (
            this.gameState.ballY < this.gameState.ballRadius ||
            this.gameState.ballY > 1000 - this.gameState.ballRadius
        )
            this.gameState.ballAngle += 2 * (Math.PI - this.gameState.ballAngle);
        this.playerPaddle();
        this.computerPaddle();

        if (this.gameState.ballX < this.gameState.ballRadius) {
            this.gameState.computerScore++;
            this.startTurn();
        }
        if (this.gameState.ballX > 1000 - this.gameState.ballRadius) {
            this.gameState.playerScore++;
            this.startTurn();
        }
        this.broadcastGame();
    }

    private playerPaddle() {
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

    private computerPaddle() {
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

    private updatePlayerPaddle(delta: number) {
        this.gameState.playerY += delta * this.gameState.playerSpeed;
        this.gameState.playerY = Math.max(this.gameState.playerY, 0);
        this.gameState.playerY = Math.min(
            this.gameState.playerY,
            1000 - this.gameState.playerHeight
        );
    }

    private updateComputerPaddle(delta: number) {
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
                ? this.player1.username
                : this.player2.username
        );
        return true;
    }

    private setWinner(winner: string) {
        this.broadcastGame();
        this.broadcastCmd('score', winner);
        this.gameState.ingame = false;
        this.broadcastCmd('ingame', 0);
        clearInterval(this.gameState.intervalId);
		this.gameState.intervalId = 0;
        if (this.player2?.socket) {
            this.clients.push(this.clients.splice(this.clients.indexOf(this.player2), 1)[0]);
            this.player1.registered = false;
        }
        if (this.player2?.socket) {
            this.clients.push(this.clients.splice(this.clients.indexOf(this.player2), 1)[0]);
            this.player2.registered = false;
        }
        this.broadcastPosition();
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
}
