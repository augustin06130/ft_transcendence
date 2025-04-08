import { WebSocket } from '@fastify/websocket';

export type Match = {
	player1: Client | null;
	player2: Client | null;
	winner: Client | null;
	score1: number;
	score2: number;
	travel1: number;
	travel2: number;
	rally: number;
	date: number;
	duration: number;
};
export type MatchDB = Omit<Match, 'player1' | 'player2' | 'winner'> & { player1: string, player2: string, winner: String }
export type GameMode = 'ai' | 'local' | 'remote';

type Role = 'player1' | 'player2' | 'local' | 'spec';

export type MatchTree = {
	match: Match;
	left: MatchTree | null;
	right: MatchTree | null;
};

export type Client = {
	username: string;
	socket: WebSocket | null;
};

export type Cmd = {
	cmd: string;
	[key: `arg${number}`]: string;
};

export type PongState = {
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
	intervalId: ReturnType<typeof setInterval> | null;
	playerSpeed: number;
	computerSpeed: number;
	paddleWidth: number;
	ballAngle: number;
	ballSpeed: number;
};
