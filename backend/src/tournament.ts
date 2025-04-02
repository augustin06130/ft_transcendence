import { Client, GameMode } from './pong';

export type Match = {
	player1: Client | null;
	player2: Client | null;
	left: Match | null;
	right: Match | null;
	winner: Client | null;
};

const aiClient: Client = {
	username: 'computer',
	socket: null,
};

const guestClient: Client = {
	username: 'Guest',
	socket: null,
};

export default class Tournament {
	private matches: Match;
	public players: Client[];
	public started: boolean;
	public mode: GameMode;
	constructor() {
		this.mode = 'ai';
		this.players = [];
		this.matches = {
			player1: null,
			player2: null,
			left: null,
			right: null,
			winner: null,
		};
		this.started = false;
	}

	buildMatchs(players: Client[]): Match {
		let result: Match = {
			player1: null,
			player2: null,
			left: null,
			right: null,
			winner: null,
		};

		if (players.length === 0) {
			throw 'Error: no player in Tournament';
		} else if (players.length === 1) {
			result.player1 = players[0];
		} else if (players.length === 2) {
			result.player1 = players[0];
			result.player2 = players[1];
		} else if (players.length === 3) {
			result.player1 = players[0];
			result.right = this.buildMatchs(players.slice(1));
		} else {
			const middle = Math.floor(players.length / 2);
			result.left = this.buildMatchs(players.slice(0, middle));
			result.right = this.buildMatchs(players.slice(middle));
		}
		return result;
	}

	addPlayer(player: Client) {
		this.players.push(player);
		this.matches = this.buildMatchs(this.players);
	}

	removePlayer(player: Client) {
		this.players = this.players.filter((c: Client) => c !== player);
		if (this.players.length > 1) this.matches = this.buildMatchs(this.players);
	}

	makeMatch(player2: Client): Match {
		return {
			player1: this.players[0],
			player2,
			left: null,
			right: null,
			winner: null,
		};
	}

	nextMatch(match: Match = this.matches): Match | null {
		if (this.mode === 'ai')
			return this.makeMatch(aiClient)
		if (this.mode === 'local')
			return this.makeMatch(guestClient)
		if (this.players.length < 2)
			return null;
		if (!match.player2) {
			if (!match.right) throw 'error match tree right';
			if (match.right.winner) {
				match.player2 = match.right.winner;
			} else {
				return this.nextMatch(match.right);
			}
		}
		if (!match.player1) {
			if (!match.left) throw 'error match tree left';
			if (match.left.winner) {
				match.player1 = match.left.winner;
			} else {
				return this.nextMatch(match.left);
			}
		}
		if (match.player1 && match.player2 && !match.winner) {
			this.started = true;
			return match;
		}
		this.started = false;
		return null;
	}

	setWinner(match: Match, winner: Client) {
		match.winner = winner;
	}

	static getMatchString(match: Match, player2: string | null = null): string {
		return `${match.player1?.username || 'TBD'} vs. ${player2 || match.player2?.username || 'TBD'}`;
	}

	stringify(
		lines: string[] = [],
		match: Match = this.matches,
		depth: number = 0,
		matchUp: Match = this.matches,
		lineUp: string = '',
	) {
		let line: string = '';

		if (depth >= 1) {
			for (let i = 0; i < depth * 2; i++) {
				if (lineUp[i] === '├' || lineUp[i] === '│') {
					line += '│'
				}
				else {
					line += ' '
				}
			}
			if (match === matchUp.left) {
				if (matchUp.right) {
					line += '├─';
				} else {
					line += '└─';
				}
			}
			else if (match === matchUp.right) {
				line += '└─';
			}
		}

		line += Tournament.getMatchString(match);
		lines.push(line);
		if (match.left)
			this.stringify(lines, match.left, depth + 1, match, line);
		if (match.right)
			this.stringify(lines, match.right, depth + 1, match, line);
		return lines;
	}
}

// export type Client = {
// 	username: string;
// 	socket: WebSocket | null;
// 	registered: boolean;
// };
//
// const tour = new Tournament;
//
// for (let i = 0; i <= 25; i++) {
// 	tour.addPlayer({ username: i.toString(), socket: null, registered: false });
// }
//
// console.log(tour.stringify().join('\n'));
