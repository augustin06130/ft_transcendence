import { FastifyReply, FastifyRequest } from 'fastify';
import { Database } from 'sqlite3';
import { Match } from './types';
import { db } from './main';

export function createTableMatches() {
	const sql = `
       CREATE TABLE IF NOT EXISTS matches (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           player1 TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE,
           player2 TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE,
           winner  TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE,
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
			throw `Error creating table: ` + err;
		}
		console.log("'matches' table has been created successfully.");
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

export function addMatch(db: Database, match: Match) {
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
		sql = 'SELECT CEIL(COUNT() / 25.0) as [count] FROM matches WHERE player1 = ? OR player2 = ?';
	} else {
		sql = 'SELECT CEIL(COUNT() / 25.0) as [count] FROM matches';
	}
	db.get(sql, params, (err, count: any) => {
		if (err) {
			console.error('Error counting maches:', err.message);
			reply.code(400);
		} else {
			reply.code(200).send(count);
		}
	});
}

export function getMatches(request: FastifyRequest, reply: FastifyReply) {
	let { username, page } = request.query as { username: string; page: number };
	let sql = 'SELECT * FROM matches ';
	let params: (string | number)[] = [];
	if (page === undefined) page = 0;
	if (username === undefined) {
		sql += 'ORDER BY date DESC LIMIT ?, ?;';
	} else {
		sql += 'WHERE player1 = ? OR player2 = ? ORDER BY date DESC  LIMIT ?, ?;';
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

export async function getStats(request: FastifyRequest, reply: FastifyReply) {
	let { username: name } = request.query as { username: string };

	let ret: Object = {};

	try {
		Object.assign(ret, await globalStat(name));
		Object.assign(ret, await nameStat(name, 1));
		Object.entries(await nameStat(name, 2)).forEach(([k, v]) => ((ret as any)[k] += v));
		Object.assign(ret, await wiinerStat(name));
	} catch (err) {
		console.error('Error while retrieving stats', err);
		reply.status(404);
	}

	reply.send(ret);
}

async function globalStat(player: string) {
	const sql = `SELECT
		COUNT()		as [countMatch],
		AVG(duration)	as [avgDuration],
		SUM(duration)	as [sumDuration],
		MIN(date)		as [firstMatch],
		MAX(date)		as [lastestMatch],
		SUM(rally)		as [sumRally],
		AVG(rally)		as [avgRally]
		FROM matches WHERE player1 = ? OR player2 = ?;
	`;

	const params = [player, player];
	return getPromise(sql, params);
}
async function nameStat(player: string, role: number) {
	const sql = `SELECT
		SUM(travel1)	as [sumTravel],
		AVG(travel1)	as [avgTravel],
		SUM(score1)		as [sumScore],
		AVG(score1)		as [avgScore]
		FROM matches WHERE player${role} = ?;
	`;

	const params = [player];
	return getPromise(sql, params);
}
async function wiinerStat(player: string) {
	const sql = `SELECT
		COUNT()		as [countWin],
		SUM(travel1)	as [sumTravelWin],
		AVG(travel1)	as [avgTravelWin],
		AVG(duration)	as [avgDurationWin],
		SUM(duration)	as [sumDurationWin],
		MIN(date)		as [firstMatchWin],
		MAX(date)		as [lastestMatchWin],
		SUM(rally)		as [sumRallyWin],
		AVG(rally)		as [avgRallyWin]
		FROM matches WHERE winner = ?;
	`;

	const params = [player];
	return getPromise(sql, params);
}

async function getPromise(sql: string, params: any[]) {
	return new Promise<any>((resolve, reject) => {
		db.get(sql, params, (err, data) => {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
}
