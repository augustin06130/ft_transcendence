import { allPromise, getPromise, runPromise } from './promise';
import { FastifyReply, FastifyRequest } from 'fastify';
import { logoutUser, setJwt } from './auth';
import { JWTPayload, User } from './types';
import { readFileSync } from 'node:fs';
import { sendSuccess } from './routes';
import { isFriend } from './friends';
import { htoms } from './utils';
import path from 'path';

const defaultImage =
    'data:image/png;base64,' +
    readFileSync(path.join(__dirname, '../public/default-avatar.png')).toString('base64');

export async function createTableUser() {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
		googleId TEXT UNIQUE,
		bio TEXT,
        image BLOB,
		tfaSecret BLOB,
		tfaOn INTEGER NOT NULL,
		date INTEGER NOT NULL,
		deletionDate INTEGER NOT NULL,
		password TEXT
      )`;

    await runPromise(sql);
    if (!(await getUserBy('username', 'Computer')))
        await createNewUserGoogle(
            'Computer',
            'computer@ping.pong',
            'computer',
            Number.MAX_SAFE_INTEGER
        );
    if (!(await getUserBy('username', 'Guest')))
        await createNewUserGoogle('Guest', 'guest@ping.pong', 'guest', Number.MAX_SAFE_INTEGER);
}

export async function getUserBy(key: string, value: string | number): Promise<User> {
    return getPromise(`SELECT * FROM users WHERE ${key} = ?;`, [value]);
}

export async function createNewUserGoogle(
    username: string,
    email: string,
    googleId: string = '',
    deletionDate: number = 0
) {
    const sql = `
          INSERT INTO users (username, email, googleId, image, tfaON, date, deletionDate)
          VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

    const params = [
        username,
        email,
        googleId,
        defaultImage,
        0,
        Date.now(),
        deletionDate || Date.now() + htoms(1),
    ];
    return await runPromise(sql, params);
}

export async function createNewUserPass(username: string, email: string, hashPass: string) {
    const sql = `
          INSERT INTO users (username, email, password, image, tfaON, date, deletionDate)
          VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

    const params = [username, email, hashPass, defaultImage, 0, Date.now(), Date.now() + htoms(1)];
    return await runPromise(sql, params);
}

export async function updateProfileImage(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.user as { id: number };
    const sql = 'UPDATE users SET image = ? WHERE id = ?;';
    const params = [request.body, id];
    await runPromise(sql, params);
    sendSuccess(reply, 204);
}

export async function updateProfile(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.user as { id: number };
    let body = request.body as {
        username: string;
        email: string;
        bio: string;
    };
    if ((await getUserBy('username', body.username)).id !== id)
        throw { code: 400, message: 'Duplicate username' };
    if ((await getUserBy('email', body.email)).id !== id)
        throw { code: 400, message: 'Duplicate email' };

    let user = await getUserBy('id', id);
    if (!id || !user) throw { code: 404, message: 'Google id not found' };

    let sql = 'UPDATE users\nSET ';
    const params: (string | number)[] = [];

    Object.entries(body).forEach(([key, value], i, array) => {
        sql += key + ' = ?';
        params.push(value);
        if (i != array.length - 1) sql += ', ';
        else sql += '\n';
    });

    if (!params.length) throw { code: 404, message: 'Not params to update' };

    sql += 'WHERE id = ?;';
    params.push(id);

    await runPromise(sql, params);
    user = await getUserBy('id', id);
    setJwt(user, reply, false);
    sendSuccess(reply, 204);
}

export async function getProfile(request: FastifyRequest, reply: FastifyReply) {
    const { username } = request.query as { username: string };
    let sql, params;
    sql = `SELECT username, email, bio, image, tfaOn FROM users WHERE username = ?;`;
    params = [username];
    let isF = await isFriend((request.user as any).username, username);
    const row: any = await getPromise(sql, params);
    row['isfriend'] = isF;
    sendSuccess(reply, 200, row);
}

export async function getUsername(id: number) {
    return getPromise('SELECT username WHERE id = ?;', [id]);
}

export async function getUsernameList(request: FastifyRequest, reply: FastifyReply) {
    const { username } = request.query as { username: string };
    const sql = `SELECT username FROM users WHERE username LIKE ?;`;
    const params = [`${username}%`];
    sendSuccess(reply, 200, { data: await allPromise(sql, params) });
}

export async function isUser(request: FastifyRequest, reply: FastifyReply) {
    const { username } = request.query as { username: string };
    sendSuccess(reply, 200, await getUserBy('username', username));
}

export async function setUserBy(key: string, value: string, by: string, byvalue: string) {
    const sql = `UPDATE users SET ${key} = ? WHERE ${by} = ?;`;
    const params = [value, byvalue];
    await runPromise(sql, params);
}

export async function deleteUser(request: FastifyRequest, reply: FastifyReply) {
    const id = (request.user as JWTPayload).id;
    const sql = 'DELETE FROM users WHERE id = ?';
    const params = [id];
    await runPromise(sql, params);
    await logoutUser(request, reply);
}

export function updateUserDeletionDate(id: number) {
    runPromise(`UPDATE users SET deletionDate = ${Date.now() + htoms(24 * 365)} WHERE id = ?`, [
        id,
    ]);
}

export function startUsersCleaning() {
    const sql = `DELETE FROM users WHERE deletionDate < ${Date.now()}`;
    runPromise(sql),
        setInterval(
            () => runPromise(sql),
            htoms(1) // 1h
        );
}

export function setCookie(_: FastifyRequest, reply: FastifyReply) {
    reply.setCookie('cookiesOn', '1', {
        path: '/',
        sameSite: 'strict',
        secure: true,
    });
    sendSuccess(reply, 200);
}
