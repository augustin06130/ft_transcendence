import { Game } from './game/Game';

// Initialisation du canvas
const canvas = document.getElementById('pongCanvas') as HTMLCanvasElement;
const context = canvas.getContext('2d');

if (!context) {
    throw new Error('Impossible de récupérer le contexte du canvas.');
}

// Crée une instance du jeu
const game = new Game(canvas, context);

// Lance le jeu
game.start();
