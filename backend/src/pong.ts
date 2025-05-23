import { Match, Client, Cmd, PongState } from './types';
import { onlineUserStatus } from './onlineUsers';
import { WebSocket } from '@fastify/websocket';
import { FastifyRequest } from 'fastify';
import Tournament from './tournament';
import { addMatch } from './matches';

const WINNING_SCORE = 3;

export type GameMode = 'ai' | 'local' | 'remote';
const gameModes: GameMode[] = ['ai', 'local', 'remote'];

export default class PongGame {
    private player1: Client | undefined;
    private player2: Client | undefined;
    private clients: Client[] = [];
    public tournament: Tournament = new Tournament();
    private dir: number = 1;
    private kill: () => void;
    private match: Match | null = null;
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
        playerSpeed: 6,
        computerSpeed: 6,
        paddleWidth: 10,
        intervalId: null,
        lastTime: 0,
        dt: 5,
        speedX: 0,
        speedY: 0,
    };

    constructor(kill: () => void) {
        this.updateGame = this.updateGame.bind(this);
        this.kill = kill;
    }

    public hasPlayer(name: string): boolean {
        for (let p of this.clients) {
            if (p.username === name) return true;
        }
        return false;
    }

    public tournamentTree(): string {
        return this.tournament.stringify().join('\n');
    }

    public joinGame(socket: WebSocket, request: FastifyRequest) {
        const username = (request.user as any).username;
        const client = { username, socket };

        this.sendCmd(client, 'username', username);

        this.clients.push(client);
        this.broadcastPosition();
        this.sendCmd(client, 'ingame', +this.gameState.ingame);

        socket.on('message', (message: any) => this.onMessageHandle(message, client));
        socket.on('close', () => this.leaveGame(client));
    }

    private leaveGame(client: Client) {
        if (client.username in onlineUserStatus) {
            onlineUserStatus[client.username].status = 'online';
        }

        if (client === this.player2 || client === this.player1) {
            this.broadcastCmd('info', `Player: ${client.username} disconnected`);
            if (this.gameState.ingame)
                this.setWinner((client === this.player1 ? this.player2 : this.player1) as Client);
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
            this.match!.travel1 += this.gameState.playerSpeed * +(parseInt(data.arg1) !== 0);
        } else {
            this.computerPaddlePos(parseInt(data.arg1));
            this.match!.travel1 += this.gameState.computerSpeed * +(parseInt(data.arg1) !== 0);
        }
    }

    private startGame() {
        if (!this.player1?.socket) {
            return this.broadcastCmd('info', 'not enough player is the room');
        }
        if (this.gameState.ingame) {
            return;
        }
        this.match = this.tournament.nextMatch();
        this.match!.date = Date.now();
        this.gameState.ingame = true;
        this.broadcastCmd('ingame', 1);
        this.gameState.playerScore = 0;
        this.gameState.computerScore = 0;
        this.match!.rally = 0;
        this.startTurn();
    }

    private changeModeHanble() {
        if (this.gameState.ingame) return;
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
        } else {
            matchString = 'Not enough players in the room';
        }

        this.broadcastCmd(
            'setNames',
            this.tournament.mode,
            this.player1?.username || 'Player1',
            this.player2?.username || 'Player2',
            matchString
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
            this.gameState.paddleWidth, // 9
            this.gameState.speedX, //10
            this.gameState.speedY, //11
            this.gameState.dt //12
        );
    }

    private startTurn() {
        this.broadcastGame();
        if (this.gameState.intervalId) clearInterval(this.gameState.intervalId);
        this.gameState.intervalId = null;

        if (this.checkWinner()) return;

        this.gameState.playerY = 500 - this.gameState.playerHeight / 2;
        this.gameState.computerY = 500 - this.gameState.computerHeight / 2;
        this.gameState.ballX = 500;
        this.gameState.ballY = 500;
        this.gameState.ballAngle = (Math.PI * (2 * Math.random() - 1)) / 4;
        if (this.dir++ % 2) {
            this.gameState.ballAngle = (this.gameState.ballAngle + Math.PI) % (2 * Math.PI);
        }
        this.gameState.ballSpeed = 0.4;

        this.broadcastGame();
        this.gameState.lastTime = 0;
        setTimeout(() => {
            this.gameState.intervalId = setInterval(this.updateGame, 5) as any;
        }, 1000);
    }

    private updateGame() {
        try {
            let last = this.gameState.lastTime;
            let now = Date.now();
            this.gameState.dt = now - last;
            this.gameState.lastTime = now;

            if (!last) return;

            this.gameState.speedX = this.gameState.ballSpeed * Math.cos(this.gameState.ballAngle);
            this.gameState.speedY = -this.gameState.ballSpeed * Math.sin(this.gameState.ballAngle);
            this.gameState.ballX += this.gameState.speedX * this.gameState.dt;
            this.gameState.ballY += this.gameState.speedY * this.gameState.dt;

            if (
                this.gameState.ballY < this.gameState.ballRadius ||
                this.gameState.ballY > 1000 - this.gameState.ballRadius
            ) {
                this.gameState.ballAngle += 2 * (Math.PI - this.gameState.ballAngle);
                this.gameState.ballY = Math.min(
                    Math.max(this.gameState.ballY, this.gameState.ballRadius + 1),
                    1000 - this.gameState.ballRadius - 1
                );
            }

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
        } catch (err) {
            console.warn('Fatal errror:', err);
            this.broadcastCmd('ingame', -1);
            this.broadcastCmd('error', 'Please reconnect');
            this.gameState.ingame = false;
            if (this.gameState.intervalId) clearInterval(this.gameState.intervalId);
        }
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
            this.gameState.ballSpeed += 0.04;
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
            this.gameState.ballSpeed += 0.04;
            this.match!.rally++;
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
                ? (this.player1 as Client)
                : (this.player2 as Client)
        );
        return true;
    }

    private setWinner(winner: Client) {
        if (this.gameState.intervalId) clearInterval(this.gameState.intervalId);
        this.gameState.intervalId = null;
        if (!this.match) return console.error('not match set at the end on the match');
        this.match.winner = winner;
        this.match.score1 = this.gameState.playerScore;
        this.match.score2 = this.gameState.computerScore;
        this.match.duration = Date.now() - this.match.date;

		try {
        	addMatch(this.match);
		} catch (err) {
			console.warn(err);
		}

        this.broadcastCmd('score', winner.username);
        if (this.tournament.mode === 'remote' && this.tournament.nextMatch()) {
            this.broadcastCmd('ingame', -1);
        } else {
            this.tournament = new Tournament();
            this.broadcastCmd('ingame', 0);
        }
        this.gameState.ingame = false;
        this.broadcastPosition();
    }
}
