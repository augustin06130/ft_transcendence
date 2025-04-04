import { Database } from 'sqlite3';
import { FastifyReply, FastifyRequest } from 'fastify';
import { db } from './main';
import { certifUser } from './login';

type User = {
	username: string,
	email: string,
	password: string,
	name: string,
	phone: string,
	bio: string,
	image: string,
}

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
          INSERT INTO users (username, password, email)
          VALUES (?, ?, ?)
      `;
		const params = [username, hashedPassword, email];

		db.run(sql, params, function(err) {
			if (err) {
				console.error('Error creating user:', err.message); // Log the error
				reject(new Error(`Failed to create user: ${err.message}`));
			} else {
				const userId = this.lastID;
				console.log(`User '${username}' created successfully with ID: ${userId}.`); // Log success
				resolve(userId);
			}
		});
	});
}

export async function updateProfile(
	request: FastifyRequest,
	reply: FastifyReply,
): Promise<void> {

	let body = request.body as {
		username: string;
		email: string;
		phone: string;
		bio: string;
	};

	if (!body.username || ! await isUser(body.username))
		reply.status(404);

	let sql = 'UPDATE users\nSET ';
	const params: string[] = [];
	Object.entries(body).forEach(([key, value], i, array) => {
		if (key === 'username' || !value)
			return;
		sql += key + ' = ?'
		params.push(value);
		if (i != array.length)
			sql += ', ';
		else
			sql += ';';
	});

	if (!params.length)
		reply.status(404);

	// if (imagePath) {
	// 	sql += `, data = ?`;
	// 	insertImage(userId, imagePath, db, params);
	// }

	sql += ` WHERE username = ?`;
	params.push(body.username);

	console.log('body', body)
	console.log('sql', sql)
	console.log('params', params);
	db.run(sql, params, function(err) {
		if (err) {
			console.error('Error updating user:', err.message);
			reply.status(404);
		} else {
			reply.status(204);
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
		}
		else {
			reply.send(row);
		}
	});
}
