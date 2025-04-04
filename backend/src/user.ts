import { Database } from 'sqlite3';
import { FastifyReply, FastifyRequest } from 'fastify';
import { db } from './main';
import { readFileSync } from 'node:fs';
import path from 'path';

type User = {
	username: string;
	email: string;
	password: string;
	name: string;
	phone: string;
	bio: string;
	image: string;
};

export function createTableUser() {
	const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        phone TEXT,
		bio TEXT,
        image BLOB
      )`;
	db.run(sql, err => {
		if (err) {
			console.error('Error creating table:', err.message);
		} else {
			console.log("'users' table has been created successfully.");
		}
	});
}

export async function verifUser(username: string) {
	return new Promise<any>((resolve, reject) => {
		db.get('SELECT id, password FROM users WHERE username = ?', [username], (err, row) => {
			if (err) {
				reject(err);
			} else {
				resolve(row);
			}
		});
	});
}

export async function isUser(username: string): Promise<boolean> {
	return new Promise<boolean>((resolve, reject) => {
		db.get('SELECT id FROM users WHERE username = ?', [username], (err, row) => {
			if (err) {
				console.error('Error getting user Id:', err);
				reject(err);
			} else {
				resolve(!!row);
			}
		});
	});
}

export async function createNewUser(
	username: string,
	hashedPassword: string,
	email: string,
	db: Database
): Promise<number> {
	return new Promise<number>((resolve, reject) => {
		const sql = `
          INSERT INTO users (username, password, email, image)
          VALUES (?, ?, ?, ?)
      `;

		const image =
			'data:image/png;base64,' +
			readFileSync(path.join(__dirname, '../public/default-avatar.png')).toString('base64');

		const params = [username, hashedPassword, email, image];

		db.run(sql, params, function(err) {
			if (err) {
				console.error('Error creating user:', err.message);
				reject(new Error(`Failed to create user: ${err.message}`));
			} else {
				console.log(`User '${username}' created successfully with ID: ${this.lastID}.`);
				resolve(this.lastID);
			}
		});
	});
}

export async function updateProfileImage(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	return new Promise<void>(() => {
		const { username } = request.query as { username: string };
		const sql = 'UPDATE users SET image = ? WHERE username = ?;';
		const params = [request.body, username];
		db.run(sql, params, function(err) {
			if (err) {
				console.error('Error updating user image:', err.message);
				reply.code(404).send({error: err.message});
			} else {
				reply.code(204).send({});
			}
		});
	});
}

export async function updateProfile(request: FastifyRequest, reply: FastifyReply): Promise<void> {
	let body = JSON.parse(request.body as string) as {
		username: string;
		email: string;
		phone: string;
		bio: string;
	};

	if (!body.username || !(await isUser(body.username))) reply.code(404);

	let sql = 'UPDATE users\nSET ';
	const params: string[] = [];
	Object.entries(body).forEach(([key, value], i, array) => {
		if (key === 'username') return;
		sql += key + ' = ?';
		params.push(value);
		if (i != array.length - 1) sql += ', ';
		else sql += '\n';
	});

	if (!params.length) reply.code(404);

	sql += 'WHERE username = ?;';
	params.push(body.username);

	console.log('body', body);
	console.log('sql', sql);
	console.log('params', params);
	db.run(sql, params, function(err) {
		if (err) {
			console.error('Error updating user:', err.message);
			reply.code(404);
		} else {
			reply.code(204);
		}
	});
}

// async function insertImage(userId: number, imagePath: string, db: Database, params: any) {
// 	const binaryData = fs.readFileSync(imagePath);
// 	params.push(binaryData);
// 	await db.run(`UPDATE users SET data = ? WHERE id = ?`, binaryData, userId);
// 	console.log(`Image ajoutée pour l'utilisateur ID ${userId}`);
// }

// async function retrieveImage(userId: number, outputPath: string, db: Database) {
// 	return new Promise<void>((resolve, reject) => {
// 		db.get<{ data: Buffer }>(`SELECT imgae FROM users WHERE id = ?`, [userId], (err, row) => {
// 			if (err) {
// 				reject(err);
// 				return;
// 			}
//
// 			if (row && row.data) {
// 				fs.writeFileSync(outputPath, row.data);
// 				console.log(`Image récupérée et sauvegardée sous ${outputPath}`);
// 				resolve();
// 			} else {
// 				console.log(`Aucune image trouvée pour l'utilisateur ID ${userId}`);
// 				resolve();
// 			}
// 		});
// 	});
// }

export function getProfile(request: FastifyRequest, reply: FastifyReply) {
	const { username } = request.query as { username: string };
	console.log('username', username);
	let sql, params;
	sql = `SELECT username, email, phone, bio, image FROM users WHERE username = ?;`;
	params = [username];
	db.get<User>(sql, params, (err, row) => {
		if (err) {
			console.error('Error while getting profile', err.message);
			reply.send(404);
		} else {
			reply.send(row);
		}
	});
}
