import { GameMode } from './pong';
import { Client, Match, MatchTree } from './types';

const aiClient: Client = {
	username: 'computer',
	socket: null,
};

const guestClient: Client = {
	username: 'Guest',
	socket: null,
};

export function emptyMatch(): Match {
	return {
		player1: null,
		player2: null,
		winner: null,
		rally: 0,
		score1: 0,
		score2: 0,
		date: 0,
		duration: 0,
		travel1: 0,
		travel2: 0,
	};
}

export function emptyNode(match: Match = emptyMatch()): MatchTree {
	return {
		match,
		left: null,
		right: null,
	};
}

export default class Tournament {
	private matches: MatchTree;
	public players: Client[];
	public started: boolean;
	public mode: GameMode;
	constructor() {
		this.mode = 'ai';
		this.players = [];
		this.matches = { match: emptyMatch(), left: null, right: null };
		this.started = false;
	}

	buildMatchs(players: Client[]): MatchTree {
		let node = emptyNode();

		if (players.length === 0) {
			throw 'Error: no player in Tournament';
		} else if (players.length === 1) {
			node.match.player1 = players[0];
		} else if (players.length === 2) {
			node.match.player1 = players[0];
			node.match.player2 = players[1];
		} else if (players.length === 3) {
			node.match.player1 = players[0];
			node.right = this.buildMatchs(players.slice(1));
		} else {
			const middle = Math.floor(players.length / 2);
			node.left = this.buildMatchs(players.slice(0, middle));
			node.right = this.buildMatchs(players.slice(middle));
		}
		return node;
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
		let result = emptyMatch();
		result.player1 = this.players[0];
		result.player2 = player2;
		return result;
	}

	nextMatch(node: MatchTree = this.matches): Match | null {
		if (this.mode === 'ai') return this.makeMatch(aiClient);
		if (this.mode === 'local') return this.makeMatch(guestClient);
		if (this.players.length < 2) return null;
		if (!node.match.player2) {
			if (!node.right) throw 'error match tree right';
			if (node.right.match.winner) {
				node.match.player2 = node.right.match.winner;
			} else {
				return this.nextMatch(node.right);
			}
		}
		if (!node.match.player1) {
			if (!node.left) throw 'error match tree left';
			if (node.left.match.winner) {
				node.match.player1 = node.left.match.winner;
			} else {
				return this.nextMatch(node.left);
			}
		}
		if (node.match.player1 && node.match.player2 && !node.match.winner) {
			this.started = true;
			return node.match;
		}
		this.started = false;
		return null;
	}

	static getMatchString(match: Match, player2: string | null = null): string {
		return `${match.player1?.username || 'TBD'} vs. ${player2 || match.player2?.username || 'TBD'}`;
	}

	stringify(
		lines: string[] = [],
		node: MatchTree = this.matches,
		depth: number = 0,
		NodeUp: MatchTree = this.matches,
		lineUp: string = ''
	) {
		let line: string = '';

		if (depth >= 1) {
			for (let i = 0; i < depth * 2; i++) {
				if (lineUp[i] === '├' || lineUp[i] === '│') {
					line += '│';
				} else {
					line += ' ';
				}
			}
			if (node === NodeUp.left) {
				if (NodeUp.right) {
					line += '├─ ';
				} else {
					line += '└─ ';
				}
			} else if (node === NodeUp.right) {
				line += '└─ ';
			}
		} else {
			line += ' ';
		}

		let cur = this.nextMatch();
		if (cur === node.match) line += '<em class="current_match">';
		line += Tournament.getMatchString(node.match);
		if (cur === node.match) line += '</em>';

		lines.push(line);
		if (node.left) this.stringify(lines, node.left, depth + 1, node, line);
		if (node.right) this.stringify(lines, node.right, depth + 1, node, line);
		return lines;
	}
}

// **********************TEST**********************

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
