import { Ball } from './Ball';
import { Paddle } from './Paddle';

export class Game {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private ball: Ball;
    private playerPaddle: Paddle;
    private botPaddle: Paddle;

    constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.context = context;

        // Initialise la balle
        this.ball = new Ball(this.canvas.width / 2, this.canvas.height / 2, 10, 2, 2);

        // Initialise les raquettes
        const paddleWidth = 10;
        const paddleHeight = 100;
        this.playerPaddle = new Paddle(20, (this.canvas.height - paddleHeight) / 2, paddleWidth, paddleHeight);
        this.botPaddle = new Paddle(this.canvas.width - 30, (this.canvas.height - paddleHeight) / 2, paddleWidth, paddleHeight);
    }

    // Méthode pour démarrer le jeu
    start() {
        this.update();
    }

    // Méthode pour mettre à jour le jeu
    private update() {
        // Efface le canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Dessine la balle
        this.ball.draw(this.context);

        // Dessine les raquettes
        this.playerPaddle.draw(this.context);
        this.botPaddle.draw(this.context);

        // Demande la prochaine frame
        requestAnimationFrame(() => this.update());
    }
}
