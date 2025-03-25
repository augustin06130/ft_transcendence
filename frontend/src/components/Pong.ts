import { canvas, div, h2, p, button } from '@framework/tags';
import { Setter, UseStateType } from '@framework/UseState';

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
    role: 'player1' | 'player2' | 'local' | 'spec';
    deltaYplayer: number;
    deltaYcomputer: number;
    playerHeight: number;
    computerHeight: number;
    ballRadius: number;
    paddleWidth: number;
    ingame: boolean;
};

function overlay(option: { title: string; message: string; labelName: string; onclick: () => void }): HTMLElement {
    return div(
        {
            className: 'absolute inset-0 flex flex-col items-center justify-center bg-black/80',
        },
        h2({ className: 'text-2xl font-bold mb-4' }, option.title),
        p({ className: 'mb-6' }, option.message),
        button(
            {
                onclick: option.onclick,
                className: 'px-6 py-2 border border-green-500 rounded hover:bg-green-500/20 transition',
            },
            option.labelName
        )
    );
}

export default class PongGame {
    gameMode: UseStateType<GameModeType>;
    name1Set: Setter<string>;
    name2Set: Setter<string>;
    topTextSet: Setter<string>;
    state: PongState;
    canvasElement: HTMLCanvasElement;
    overlays: { [key: string]: HTMLElement } = {};
    socket: WebSocket;

    constructor(gameMode: UseStateType<GameModeType>, name1Set: Setter<string>, name2Set: Setter<string>, topTextSet: Setter<string>) {
        this.gameMode = gameMode;
        this.name1Set = name1Set;
        this.name2Set = name2Set;
        this.topTextSet = topTextSet;
        this.messageHanle = this.messageHanle.bind(this);
        this.canvasElement = canvas({
            className: 'w-full h-full border border-green-500/30 rounded',
        });
        this.handleResize = this.handleResize.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);

        this.state = this.reset();

        this.overlays['start'] = overlay({
            title: 'TERMINAL PONG',
            message: `First to ${WINNING_SCORE} wins`,
            labelName: 'READY',
            onclick: () => this.sendCmd('ready'),
        });
        this.overlays['register'] = overlay({
            title: 'Enter game',
            message: '',
            labelName: 'REGISTER',
            onclick: () => this.sendCmd('register'),
        });
        this.overlays['score'] = overlay({
            title: '',
            message: '',
            labelName: 'PLAY AGAIN',
            onclick: () => this.switchOverlay('register'),
        });
        this.overlays['error'] = overlay({
            title: 'Error',
            message: 'An error occured',
            labelName: 'RETRY',
            onclick: () => {},
        });
        this.switchOverlay('register');

        this.socket = new WebSocket(`ws://${window.location.host}/pong-ws`);
        this.socket.onopen = () => console.log('pong socket opened');
        this.socket.onmessage = (event) => this.messageHanle(event);
        this.socket.onerror = (err) => console.error('Socket error:', err);
        this.socket.onclose = () => this.displayError('You got disconnected');
    }

    switchOverlay(name: string = '') {
        Object.keys(this.overlays).forEach((key) => {
            if (key === name) this.overlays[key].style.visibility = 'visible';
            else this.overlays[key].style.visibility = 'hidden';
        });
    }

    messageHanle(msg: MessageEvent) {
        const data = JSON.parse(msg.data);
        if (data.cmd != 'update') console.log('ws data:', data);
        switch (data.cmd) {
            case 'registered':
                this.switchOverlay('start');
                break;
            case 'role':
                this.state.role = data.arg0;
                break;
            case 'setNames':
                this.setNameHandle(data);
                break;
            case 'update':
                this.updateGame(data);
                break;
            case 'score':
                this.overlays['score'].children[0].innerHTML = `${data.arg0} WON !`;
                this.overlays['score'].children[1].innerHTML = `score ${this.state.playerScore} - ${this.state.computerScore}`;
                this.state.ingame = false;
                this.switchOverlay('score');
                break;
            case 'error':
                this.displayError(data.arg0);
                break;
            // case 'mode':
            //     this.state.gameMode = data.arg0;
            //     break;
            case 'ingame':
                this.inGameHandle(data);
                break;
            case 'queuePosition':
                this.overlays['start'].children[1].innerHTML = `Your position in the queue: ${data.arg0}/${data.arg1} for the next game`;
                this.overlays['register'].children[1].innerHTML = `Players in the waiting room: ${data.arg1}`;
                break;
        }
    }

    getIngame(): boolean {
        console.log('get ingame', this.state.ingame);
        return this.state.ingame;
    }

    setNameHandle(data: any) {
        this.handleResize();
        this.gameMode.set(data.arg0);

        this.name1Set(data.arg1);
        this.name2Set(data.arg2);

        (this.overlays['start'].children[2] as HTMLElement).style.visibility = 'inherit';
        if (this.state.role === 'spec') {
            (this.overlays['start'].children[2] as HTMLElement).style.visibility = 'hidden';
            this.topTextSet('Spectator');
        } else if (this.gameMode.get() === 'local') this.topTextSet(`<---> You are playing localy <--->`);
        else if (this.state.role === 'player1') this.topTextSet(`<--- You are playing as ${data.arg1} <---`);
        else if (this.state.role === 'player2') this.topTextSet(`---> You are playing as ${data.arg2} --->`);
    }

    inGameHandle(data: any) {
        this.state.ingame = !!parseInt(data.arg0);
        if (!this.state.ingame) return;
        this.handleResize();
        this.switchOverlay();
    }

    displayError(msg: string) {
        this.overlays['error'].children[1].innerHTML = msg;
        this.switchOverlay('error');
    }

    sendCmd(cmd: string, ...args: (string | number)[]) {
        let obj: any = { cmd: cmd };
        args.forEach((arg, i) => (obj[`arg${i}`] = arg));
        this.socket.send(JSON.stringify(obj));
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
            role: 'spec',
            playerHeight: 0,
            computerHeight: 0,
            ballRadius: 0,
            paddleWidth: 0,
        };
        return this.state;
    }

    updateGame(data: any) {
        // this.state.ingame = true;
        this.state.ballX = (parseInt(data.arg0) / 1000) * this.state.canvasWidth;
        this.state.ballY = (parseInt(data.arg1) / 1000) * this.state.canvasHeight;
        this.state.playerY = (parseInt(data.arg2) / 1000) * this.state.canvasHeight;
        this.state.computerY = (parseInt(data.arg3) / 1000) * this.state.canvasHeight;
        this.state.playerScore = parseInt(data.arg4);
        this.state.computerScore = parseInt(data.arg5);
        this.state.playerHeight = (parseInt(data.arg6) / 1000) * this.state.canvasHeight;
        this.state.computerHeight = (parseInt(data.arg7) / 1000) * this.state.canvasHeight;
        this.state.ballRadius = (parseInt(data.arg8) / 1000) * this.state.canvasHeight;
        this.state.paddleWidth = (parseInt(data.arg9) / 1000) * this.state.canvasWidth;

        this.drawGame();
        this.moveLeftPaddle();
        this.moveRightPaddle();
    }

    moveLeftPaddle() {
        if (this.state.role === 'player1') this.sendCmd('paddle', 'player', this.state.deltaYplayer);
    }

    moveRightPaddle() {
        if ((this.state.role === 'player1' && this.gameMode.get() === 'local') || this.state.role == 'player2')
            this.sendCmd('paddle', 'computer', this.state.deltaYcomputer);
    }

    handleKeyDown(e: KeyboardEvent) {
        if (e.key === 'w' || e.key === 'W') this.state.deltaYplayer = -1;
        else if (e.key === 's' || e.key === 'S') this.state.deltaYplayer = 1;
        if (e.key === 'i' || e.key === 'I') this.state.deltaYcomputer = -1;
        else if (e.key === 'k' || e.key === 'K') this.state.deltaYcomputer = 1;
    }

    handleKeyUp(e: KeyboardEvent) {
        if (e.key === 'w' || e.key === 'W' || e.key === 's' || e.key === 'S') this.state.deltaYplayer = 0;
        if (e.key === 'i' || e.key === 'I' || e.key === 'k' || e.key === 'K') this.state.deltaYcomputer = 0;
    }

    handleResize() {
        const container = this.canvasElement.parentElement;
        if (!container) return;

        this.canvasElement.width = container.clientWidth;
        this.canvasElement.height = container.clientHeight;

        this.state.canvasWidth = this.canvasElement.width;
        this.state.canvasHeight = this.canvasElement.height;

        this.drawGame();
    }

    drawGame() {
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
        ctx.fillRect(0, this.state.playerY, this.state.paddleWidth, this.state.playerHeight);
        ctx.fillRect(this.state.canvasWidth - this.state.paddleWidth, this.state.computerY, this.state.paddleWidth, this.state.computerHeight);

        ctx.beginPath();
        ctx.arc(this.state.ballX, this.state.ballY, this.state.ballRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '30px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.state.playerScore.toString(), this.state.canvasWidth / 4, 50);
        ctx.fillText(this.state.computerScore.toString(), (this.state.canvasWidth * 3) / 4, 50);
    }

    render() {
        return div({ className: 'relative w-full', style: { height: '60vh' } }, this.canvasElement, ...Object.values(this.overlays));
    }
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
