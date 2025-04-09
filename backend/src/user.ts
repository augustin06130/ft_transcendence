import { FastifyReply, FastifyRequest } from 'fastify';
import { db } from './main';
import { readFileSync } from 'node:fs';
import path from 'path';
import { addUser, loginUser } from './googleAuth';
import { isFriend } from './friends';

type User = {
	username: string;
	email: string;
	name: string;
	bio: string;
	image: string;
	googleId: string;
};

export function createTableUser() {
	const sql = `
      CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
		googleId TEXT NOT NULL UNIQUE,
		bio TEXT,
        image BLOB
      )`;
	db.run(sql, async err => {
		if (err) {
			throw `Error creating table: ` + err;
		}
		if (!(await getUserBy('username', 'Computer'))) addUser('Computer', '', '-2');
		if (!(await getUserBy('username', 'Guest'))) addUser('Guest', '', '-3');
		console.log("'users' table has been created successfully.");
	});
}

export async function getUserBy(key: string, value: string): Promise<User> {
	return new Promise<User>((resolve, reject) => {
		db.get(`SELECT * FROM users WHERE ${key} = ?;`, [value], (err, user: User) => {
			if (err) {
				console.error('Error getting user:', err);
				reject(err);
			} else {
				resolve(user);
			}
		});
	});
}

export async function createNewUser(
	username: string,
	email: string,
	googleId: string
): Promise<number> {
	return new Promise<number>((resolve, reject) => {
		const sql = `
          INSERT INTO users (username, email, googleId, image)
          VALUES (?, ?, ?, ?)
      `;

		const image =
			'data:image/png;base64,' +
			readFileSync(path.join(__dirname, '../public/default-avatar.png')).toString('base64');

		const params = [username, email, googleId, image];

		db.run(sql, params, function(err) {
			if (err) {
				console.error('Error creating user:', err.message);
				reject(`Failed to create user: ${err.message}`);
			} else {
				console.log(`User '${username}' created successfully with ID: ${this.lastID}.`);
				resolve(this.lastID);
			}
		});
	});
}

export async function updateProfileImage(request: FastifyRequest, reply: FastifyReply) {
	const { googleId } = request.query as { googleId: string };
	const sql = 'UPDATE users SET image = ? WHERE googleId = ?;';
	const params = [request.body, googleId];
	db.run(sql, params, function(err) {
		if (err) {
			console.error('Error updating user image:', err.message);
			reply.code(404).send({ error: err.message });
		} else {
			reply.code(204).send({});
		}
	});
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
	console.log('sql', sql);

	db.run(sql, params, function(err) {
		if (err) {
			console.error('Error updating user:', err.message);
			reply.code(404);
		} else {
			loginUser(googleId, reply);
			// if (body.username)
			//     reply.setCookie('username', body.username, {
			//         path: '/',
			//         sameSite: 'strict',
			//         maxAge: 3600,
			//     });
			// reply.code(204);
		}
	});
}

export async function getProfile(request: FastifyRequest, reply: FastifyReply) {
	const { username } = request.query as { username: string };
	let sql, params;
	sql = `SELECT username, email, bio, image FROM users WHERE username = ?;`;
	params = [username];
	let isF = await isFriend((request.user as any).username, username);
	db.get<User>(sql, params, (err, row) => {
		if (err) {
			console.error('Error while getting profile', err.message);
			reply.send(404);
		} else {
			(row as any)['isfriend'] = isF;
			reply.send(row);
		}
	});
}

export async function getUsername(googleId: string) {
	return new Promise<string>((resolve, reject) => {
		db.get('SELECT username WHERE googleId = ?;', [googleId], (err, username: string) => {
			if (err) {
				reject();
			} else {
				console.log(username);
				resolve(username);
			}
		});
	});
}

export async function getUsernameList(request: FastifyRequest, reply: FastifyReply) {
	const { username } = request.query as { username: string };
	const sql = `SELECT username FROM users WHERE username LIKE '${username}%';`;
	db.all(sql, (err, rows) => {
		if (err) {
			throw { code: 404, message: 'Error getting user list' };
		} else {
			reply.send(rows);
		}
	});
}

export async function isUser(request: FastifyRequest, reply: FastifyReply) {
	const { username } = request.query as { username: string };
	getUserBy('username', username)
		.then(row => {
			if (row) {
				reply.send(true);
			} else {
				reply.send(false);
			}
		})
		.catch(err => {
			reply.code(404).send({ err });
		});
}

export function setUserBy(key: string, value: string, by: string, byvalue: string) {
	const sql = `UPDATE users SET ${key} = ? WHERE ${by} = ?;`;
	const params = [value, byvalue];
	db.run(sql, params, err => {
		if (err) {
			throw 'Error setting user';
		}
	});
}

// export async function getStatus(username: string) {
// 	return new Promise<any>((resolve, reject) => {
// 		const sql = `SELECT u.username, u.roomId
// 			FROM users u
// 			JOIN friends f ON u.username = f.friend
// 			WHERE f.username = ?`;
// 		const params = [username];
// 		db.all(sql, params, (err, rows) => {
// 			if (err) {
// 				reject(err);
// 			} else {
// 				resolve(rows);
// 			}
// 		});
// 	});
// }
