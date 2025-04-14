import { FastifyReply, FastifyRequest } from "fastify";
import { createNewUserPass, getUserBy } from "./user";
import { sendSuccess } from "./routes";
import { loginUser } from "./auth";
import bcrypt from 'bcrypt';
import { runPromise } from "./promise";

export async function verifyProfile(username:string, password:string, email:string) {
	if (!username || !password || !email)
		throw ({ code: 400, message: 'Missing required field' });
	if (await getUserBy('username', username))
		throw ({ code: 400, message: 'Duplicate username' });
	if (await getUserBy('email', email))
		throw ({ code: 400, message: 'Duplicate email' });
	if (username.length > 30)
		throw {code:400, message: 'Username too long (30)'}
	if (email.length > 50)
		throw {code:400, message: 'Email too long (50)'}
	if (password.length < 8)
		throw {code:400, message: 'Password too short (8)'}
}

export async function registerPass(request: FastifyRequest, reply: FastifyReply) {

	const { username, email, password } = request.body as {
		username: string;
		email: string;
		password: string;
	};
	await verifyProfile(username, password, email);

	const hashedPassword = bcrypt.hashSync(password, 10);
	await createNewUserPass(username, email, hashedPassword);
	sendSuccess(reply)
}

export async function loginPass(request: FastifyRequest, reply: FastifyReply) {
	const { username, password } = request.body as {
		username: string;
		password: string;
	};
    if (username.length > 30) throw { code: 400, message: 'User name too long' };
	const user = await getUserBy('username', username);
	if (!user || !bcrypt.compareSync(password, user.password))
		throw ({ code: 403, message: 'wrong username of password' });
	await loginUser(user.id, reply);
}

export async function updatePass(request: FastifyRequest, reply: FastifyReply) {
	const { id } = request.user as { id: number };
	const { password } = request.body as { password: string };

	if (password.length < 8)
		throw {code:400, message: 'Password too short (8)'}

	const sql = 'UPDATE users SET password = ? WHERE id = ?';
	const params = [bcrypt.hashSync(password, 10), id]
	await runPromise(sql, params);
	sendSuccess(reply);
}
