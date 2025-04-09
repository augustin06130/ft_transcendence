import { FastifyRequest, FastifyReply } from 'fastify';
import { db } from './main';
import { getStatus } from './user';

export function createTableFriends() {
	const sql = `
      CREATE TABLE IF NOT EXISTS friends (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE,
        friend TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE,
		date INTEGER
      )`;
	db.run(sql, err => {
		if (err) {
			throw `Error creating table: ` + err;
		}
		console.log("'friends' table has been created successfully.");
	});
}

export async function addFriend(request: FastifyRequest, reply: FastifyReply) {
	let { username, friend } = JSON.parse(request.body as string) as {
		username: string;
		friend: string;
	};
	const sql = 'INSERT INTO friends (username, friend, date) VALUES (?,?,?);';
	const params = [username, friend, Date.now()];
	db.run(sql, params, err => {
		if (err) {
			throw { code: 400, messsage: `Error adding friendship: ${err}` };
		}
		reply.code(201).send();
	});
}

export async function removeFriend(request: FastifyRequest, reply: FastifyReply) {
	let { username, friend } = JSON.parse(request.body as string) as {
		username: string;
		friend: string;
	};
	const sql = 'DELETE FROM friends WHERE username = ? AND friend = ?;';
	const params = [username, friend];
	db.run(sql, params, err => {
		if (err) {
			throw { code: 400, messsage: 'Error removing friendship' };
		}
		reply.code(204).send();
	});
}

export async function getFriends(request: FastifyRequest, reply: FastifyReply) {
	const { username } = request.query as { username: string };
	const sql = 'SELECT * FROM friends WHERE username = ?';
	const params = [username];
	const rooms = await getStatus(username);
	db.all(sql, params, (err, rows: any) => {
		if (err) throw { code: 400, messsage: 'Could not retrieve friendship' };
		rooms.sort((a: any, b: any) => a.username > b.username);
		rows.sort((a: any, b: any) => a.username > b.username);
		rows.forEach((_: any, i: number) => {
			if (rows[i].username !== rooms[i].username) {
				rows[i]['room'] = rooms[i].roomId;
			} else {
				console.error('oupsi', rows[i], rooms[i]);
			}
		});
		reply.send(rows);
	});
}

export async function isFriend(username: string, friend: string) {
	return new Promise<boolean>((resolve, reject) => {
		const sql = 'SELECT * FROM friends WHERE username = ? AND friend = ?';
		const params = [username, friend];
		db.get(sql, params, (err, row) => {
			if (err) {
				reject();
			} else {
				resolve(!!row);
			}
		});
	});
}
