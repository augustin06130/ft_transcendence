import { Database } from 'sqlite3';
import { Match } from './types';
import { FastifyReply, FastifyRequest } from 'fastify';
import { db } from './main';

export function createTableMatches() {
    const sql = `
       CREATE TABLE IF NOT EXISTS matches (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           player1 TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE,
           player2 TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE,
           winner TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE,
           score1 INTEGER NOT NULL,
           score2 INTEGER NOT NULL,
           travel1 INTEGER NOT NULL,
           travel2 INTEGER NOT NULL,
           rally INTEGER NOT NULL,
           date INTEGER NOT NULL,
           duration INTEGER NOT NULL
       )`;

    return db.run(sql, err => {
        if (err) {
            console.error('Error creating stats table:', err.message);
        } else {
            console.log("The table 'matches' has been created successfully.");
        }
    });
}

function objectToStr(obj: Object) {
    return Object.keys(obj).reduce(
        (acc, key, i, arr) => `${acc}${key}${i != arr.length - 1 ? ', ' : ''}`,
        ''
    );
}

function objectToQuestion(obj: Object) {
    return Object.keys(obj).reduce(
        (acc, _, i, arr) => `${acc}?${i != arr.length - 1 ? ', ' : ''}`,
        ''
    );
}

// export type Match = {
// 	player1: Client | null;
// 	player2: Client | null;
// 	winner: Client | null;
// 	score1: number;
// 	score2: number;
// 	travel1: number;
// 	travel2: number;
// 	rally: number;
// 	date: number;
// 	duration: number;
// };

export async function addMatch(db: Database, match: Match) {
    const sql = `
			INSERT INTO matches (${objectToStr(match)})
			VALUES (${objectToQuestion(match)})
		`;
    let params: any = Object.values(match);
    params[0] = match.player1?.username;
    params[1] = match.player2?.username;
    params[2] = match.winner?.username;
    console.log(params);
    db.run(sql, params, err => {
        if (err) {
            console.error('Error while inserting match', err.message);
        } else {
            console.log('Match data added to databse');
        }
    });
}

const pageSize = 25;

export function getMatchesCount(request: FastifyRequest, reply: FastifyReply) {
    let { username } = request.query as { username: string };
    const params = [username, username];
    let sql;
    if (username) {
        sql = 'SELECT COUNT (id) FROM matches WHERE player1 = ? OR player2 = ?';
    } else {
        sql = 'SELECT COUNT (id) FROM matches';
    }
    db.get(sql, params, (err, count: any) => {
        if (err) {
            console.error('Error counting maches:', err.message);
            reply.code(400);
        } else {
            reply.code(200).send({ count: Math.ceil(count['COUNT (id)'] / pageSize) });
        }
    });
}

export function getMatches(request: FastifyRequest, reply: FastifyReply) {
    let { username, page } = request.query as { username: string; page: number };
    let sql,
        params: (string | number)[] = [];
    if (page === undefined) page = 0;
    if (username === undefined) {
        sql = `SELECT * FROM matches LIMIT ?, ?;`;
    } else {
        sql = `SELECT * FROM matches WHERE player1 = ? OR player2 = ? LIMIT ?, ?;`;
        params = [username, username];
    }
    params.push(page * pageSize, pageSize);
    db.all<Match>(sql, params, (err, rows) => {
        if (err) {
            console.error('Error while retrieving matches', err.message);
            reply.status(404);
        } else {
            reply.send(rows);
        }
    });
}
