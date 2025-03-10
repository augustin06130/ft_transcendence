export class Paddle {
    constructor(
        public x: number,
        public y: number,
        public width: number,
        public height: number
    ) {}

    // Méthode pour dessiner la raquette
    draw(context: CanvasRenderingContext2D) {
        context.fillStyle = '#ecf0f1';
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}
