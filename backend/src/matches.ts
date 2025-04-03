import { Database } from 'sqlite3';
import { Match } from './types';
import { FastifyReply, FastifyRequest } from 'fastify';
import { db } from './main';

export async function createTableMatches(db: Database): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		const sql = `
			CREATE TABLE IF NOT EXISTS matches (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				player1 TEXT,
				player2 TEXT,
				winner TEXT,
				score1 INTEGER,
				score2 INTEGER,
				travel1 INTEGER,
				travel2 INTEGER,
				rally INTEGER,
				date INTEGER,
				duration INTEGER
			)
		`;
		db.run(sql, err => {
			if (err) {
				console.error('Error creating stats table:', err.message); // Log the error
				reject(err);
			} else {
				console.log("The table 'matches' has been created successfully."); // Log success
				resolve();
			}
		});
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

export async function addMatch(db: Database, match: Match) {
	return new Promise<void>((resolve, reject) => {
		const sql = `
			INSERT INTO matches (${objectToStr(match)})
			VALUES (${objectToQuestion(match)})
		`;
		let params: any = Object.values(match);
		params[0] = JSON.stringify({ username: match.player1?.username });
		params[1] = JSON.stringify({ username: match.player2?.username });
		params[2] = JSON.stringify({ username: match.winner?.username });
		db.run(sql, params, err => {
			if (err) {
				console.error('Error while inserting match', err.message);
				reject(new Error(`Cannot insert match: ${err.message}`));
				return;
			}
			resolve();
		});
	});
}

export async function getMatches(db: Database, start: number, end: number) {
	return new Promise<Match[]>((resolve, reject) => {
		const sql = `SELECT * FROM matches LIMIT ?, ?;`;
		const params = [start, end];
		db.all<Match>(sql, params, (err, rows) => {
			if (err) {
				console.error('Error while retrieving matches', err.message);
				reject(new Error(`Cannot retrieve matches: ${err.message}`));
				return;
			}
			rows.forEach(match => {
				match.player1 = JSON.parse(match.player1 as any);
				match.player2 = JSON.parse(match.player2 as any);
				match.winner = JSON.parse(match.winner as any);
			});
			resolve(rows);
		});
	});
}

export async function get_stats(request: FastifyRequest, reply: FastifyReply) {
	const { name } = request.query as { name: string };
	reply.send(await getMatches(db, 0, 1000));
}

