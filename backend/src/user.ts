import { allPromise, getPromise, runPromise } from './promise';
import { FastifyReply, FastifyRequest } from 'fastify';
import { addUser, loginUser } from './googleAuth';
import { readFileSync } from 'node:fs';
import { isFriend } from './friends';
import path from 'path';

export type User = {
	username: string;
	email: string;
	name: string;
	bio: string;
	image: string;
	googleId: string;
	tfaSecret: string;
	tfaOn: string;
};

export async function createTableUser() {
	const sql = `
      CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
		googleId TEXT NOT NULL UNIQUE,
		bio TEXT,
        image BLOB,
		tfaSecret BLOB,
		tfaOn INTEGER NOT NULL
      )`;
	await runPromise(sql)
	if (!(await getUserBy('username', 'Computer'))) addUser('Computer', '', '-2');
	if (!(await getUserBy('username', 'Guest'))) addUser('Guest', '', '-3');
}

export async function getUserBy(key: string, value: string): Promise<User> {
	return getPromise(`SELECT * FROM users WHERE ${key} = ?;`, [value]);
}

export async function createNewUser(
	username: string,
	email: string,
	googleId: string
) {
	const sql = `
          INSERT INTO users (username, email, googleId, image, tfaON)
          VALUES (?, ?, ?, ?, ?)
      `;
	const image =
		'data:image/png;base64,' +
		readFileSync(path.join(__dirname, '../public/default-avatar.png')).toString('base64');

	const params = [username, email, googleId, image, 0];
	return runPromise(sql, params);
}

export async function updateProfileImage(request: FastifyRequest, reply: FastifyReply) {
	const { googleId } = request.query as { googleId: string };
	const sql = 'UPDATE users SET image = ? WHERE googleId = ?;';
	const params = [request.body, googleId];
	await runPromise(sql, params);
	reply.code(204).send({});
}

export async function updateProfile(request: FastifyRequest, reply: FastifyReply) {
	const { googleId } = request.query as { googleId: string };
	let body = JSON.parse(request.body as string) as {
		username: string;
		email: string;
		bio: string;
	};
	console.warn(request.body);

	if (!googleId || !(await getUserBy('googleId', googleId)))
		throw { code: 404, message: 'Google id not found' };

	let sql = 'UPDATE users\nSET ';
	const params: string[] = [];
	Object.entries(body).forEach(([key, value], i, array) => {
		if (key === 'googleId') return;
		sql += key + ' = ?';
		params.push(value);
		if (i != array.length - 1) sql += ', ';
		else sql += '\n';
	});

	if (!params.length) throw { code: 404, message: 'Not params to update' };

	sql += 'WHERE googleId = ?;';
	params.push(googleId);

	await runPromise(sql, params)
	loginUser(googleId, reply);
	reply.code(204);
}

export async function getProfile(request: FastifyRequest, reply: FastifyReply) {
	const { username } = request.query as { username: string };
	let sql, params;
	sql = `SELECT username, email, bio, image, tfaOn FROM users WHERE username = ?;`;
	params = [username];
	let isF = await isFriend((request.user as any).username, username);
	const row: any = await getPromise(sql, params);
	row['isfriend'] = isF;
	reply.send(row);
}

export async function getUsername(googleId: string) {
	return getPromise('SELECT username WHERE googleId = ?;', [googleId])
}

export async function getUsernameList(request: FastifyRequest, reply: FastifyReply) {
	const { username } = request.query as { username: string };
	const sql = `SELECT username FROM users WHERE username LIKE '${username}%';`;
	reply.send(await allPromise(sql));
}

export async function isUser(request: FastifyRequest, reply: FastifyReply) {
	const { username } = request.query as { username: string };
	reply.send(await getUserBy('useraname', username))
}

export async function setUserBy(key: string, value: string, by: string, byvalue: string) {
	const sql = `UPDATE users SET ${key} = ? WHERE ${by} = ?;`;
	const params = [value, byvalue];
	await runPromise(sql, params)
}
