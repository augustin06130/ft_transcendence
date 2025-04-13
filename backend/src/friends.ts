import { allPromise, getPromise, runPromise } from './promise';
import { FastifyRequest, FastifyReply } from 'fastify';
import { onlineUserStatus } from './onlineUsers';
import { sendSuccess } from './routes';

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
	let { username, friend } = request.body as {
		username: string;
		friend: string;
	};
	const sql = 'INSERT INTO friends (username, friend, date) VALUES (?,?,?);';
	const params = [username, friend, Date.now()];
	await runPromise(sql, params)
	sendSuccess(reply, 201);
}

export async function removeFriend(request: FastifyRequest, reply: FastifyReply) {
	let { username, friend } = request.body as {
		username: string;
		friend: string;
	};
	const sql = 'DELETE FROM friends WHERE username = ? AND friend = ?;';
	const params = [username, friend];
	await runPromise(sql, params)
	sendSuccess(reply, 204);
}

export async function getFriends(request: FastifyRequest, reply: FastifyReply) {
	const { username } = request.query as { username: string };
	const sql = 'SELECT * FROM friends WHERE username = ?';
	const params = [username];
	const data: any = await allPromise(sql, params);
	data.forEach((val: any) => {
		if (val.friend in onlineUserStatus) {
			val['room'] = onlineUserStatus[val.friend].status;
		} else {
			val['room'] = 'offline';
		}
	});
	sendSuccess(reply, 200, { data });
}

export async function isFriend(username: string, friend: string) {
	const sql = 'SELECT * FROM friends WHERE username = ? AND friend = ?';
	const params = [username, friend];
	return getPromise(sql, params)
}
