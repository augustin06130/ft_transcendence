import { allPromise, getPromise, runPromise } from './promise';
import { FastifyRequest, FastifyReply } from 'fastify';
import { onlineUserStatus } from './onlineUsers';

export async function createTableFriends() {
	const sql = `
      CREATE TABLE IF NOT EXISTS friends (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE,
        friend TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE,
		date INTEGER
      )`;
	await runPromise(sql)
}

export async function addFriend(request: FastifyRequest, reply: FastifyReply) {
	let { username, friend } = JSON.parse(request.body as string) as {
		username: string;
		friend: string;
	};
	const sql = 'INSERT INTO friends (username, friend, date) VALUES (?,?,?);';
	const params = [username, friend, Date.now()];
	await runPromise(sql, params)
	reply.code(201).send();
}

export async function removeFriend(request: FastifyRequest, reply: FastifyReply) {
	let { username, friend } = JSON.parse(request.body as string) as {
		username: string;
		friend: string;
	};
	const sql = 'DELETE FROM friends WHERE username = ? AND friend = ?;';
	const params = [username, friend];
	await runPromise(sql, params)
	reply.code(204).send();
}

export async function getFriends(request: FastifyRequest, reply: FastifyReply) {
	const { username } = request.query as { username: string };
	const sql = 'SELECT * FROM friends WHERE username = ?';
	const params = [username];
	const rows: any = await allPromise(sql, params);
	rows.forEach((val: any) => {
		if (val.friend in onlineUserStatus) {
			val['room'] = onlineUserStatus[val.friend].status;
		} else {
			val['room'] = 'offline';
		}
	});
	reply.send(rows);
}

export async function isFriend(username: string, friend: string) {
	const sql = 'SELECT * FROM friends WHERE username = ? AND friend = ?';
	const params = [username, friend];
	return getPromise(sql, params)
}
