export class Ball {
    constructor(
        public x: number,
        public y: number,
        public radius: number,
        public dx: number,
        public dy: number
    ) {}

    // Méthode pour dessiner la balle
    draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = '#ecf0f1';
        context.fill();
        context.closePath();
    }

    // Méthode pour mettre à jour la position de la balle
    update() {
        this.x += this.dx;
        this.y += this.dy;
    }
}
