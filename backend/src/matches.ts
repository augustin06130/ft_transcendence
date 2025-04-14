import { allPromise, getPromise, runPromise } from './promise';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Match } from './types';
import { sendSuccess } from './routes';

export async function createTableMatches() {
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

    await runPromise(sql);
}

export async function addMatch(match: Match) {
    const sql = `
			INSERT INTO matches (player1, player2, winner, rally, score1, score2, date, duration, travel1, travel2)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`;
    let params: any = Object.values(match);
    params[0] = match.player1?.username;
    params[1] = match.player2?.username;
    params[2] = match.winner?.username;
    await runPromise(sql, params);
}

const pageSize = 25;

export async function getMatchesCount(request: FastifyRequest, reply: FastifyReply) {
    let { username } = request.query as { username: string };
    const params = [username, username];
    let sql;

    if (username) {
        sql =
            'SELECT CEIL(COUNT() / 25.0) as [count] FROM matches WHERE player1 = ? OR player2 = ?';
    } else {
        sql = 'SELECT CEIL(COUNT() / 25.0) as [count] FROM matches';
    }

    sendSuccess(reply, 200, await getPromise(sql, params));
}

export async function getMatches(request: FastifyRequest, reply: FastifyReply) {
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

    sendSuccess(reply, 200, { data: await allPromise(sql, params) });
}

export async function getStats(request: FastifyRequest, reply: FastifyReply) {
    let { username: name } = request.query as { username: string };

    let ret: Object = {};

    Object.assign(ret, await globalStat(name));
    Object.assign(ret, await nameStat(name, 1));
    Object.entries(await nameStat(name, 2)).forEach(([k, v]) => ((ret as any)[k] += v));
    Object.assign(ret, await wiinerStat(name));
    sendSuccess(reply, 200, ret);
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
