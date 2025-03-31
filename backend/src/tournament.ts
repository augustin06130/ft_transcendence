import { Client } from './pong';

type Match = {
    player1: Client | null;
    player2: Client | null;
    left: Match | null;
    right: Match | null;
    winner: Client | null;
};

export default class Tournament {
    private matches: Match;
    public started: boolean;
    public players: Client[];
    constructor() {
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
            result.left = this.buildMatchs(players.slice(1));
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

    getNextMatch(match: Match | null = null): Match | null {
        if (!match) match = this.matches;
        if (!match.player1) {
            if (!match.left) throw 'error match tree';
            if (match.left.winner) {
                match.player1 = match.left.winner;
            } else {
                return this.getNextMatch(match.left);
            }
        }
        if (!match.player2) {
            if (!match.right) throw 'error match tree';
            if (match.right.winner) {
                match.player2 = match.right.winner;
            } else {
                return this.getNextMatch(match.right);
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

    getNode(match: Match) {
        let name1 = match.player1?.username || 'TBD.';
        let name2 = match.player2?.username || 'TBD.';
        return `${name1} vs. ${name2}\n`;
    }

    tree(): string {
        return this.addLines(this.stringify());
    }

    stringify(
        match: Match = this.matches,
        depth: number = 0,
        lineUp: Match = this.matches
    ): string {
        let prefix: string = '';
        if (match === lineUp.left) {
            if (lineUp.right) {
                prefix = '├─';
            } else {
                prefix = '└─';
            }
        }
        if (match === lineUp.right) {
            prefix = '└─';
        }

        if (match.left && match.right)
            return `${' '.repeat(depth * 2)}${prefix}${this.getNode(match)}${this.stringify(match.left, depth + 1, match)}${this.stringify(match.right, depth + 1, match)}`;
        else if (match.left)
            return `${' '.repeat(depth * 2)}${prefix}${this.getNode(match)}${this.stringify(match.left, depth + 1, match)}`;
        else return `${' '.repeat(depth * 2)}${prefix}${this.getNode(match)}`;
    }

    addLines(str: string): string {
        let split = str.split('\n');
        for (let i = 1; i < split.length; i++) {
            for (let j = 0; j < split[i].length && split[i][j] === ' '; j++) {
                if (split[i - 1][j] === '├' || split[i - 1][j] === '│')
                    split[i] = this.replaceAt(split[i], j, '│');
            }
        }
        return split.join('\n');
    }

    replaceAt(str: string, i: number, char: string) {
        return str.substring(0, i) + char + str.substring(i + char.length);
    }
}
