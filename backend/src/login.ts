import { FastifyReply, FastifyRequest } from "fastify";
import { createNewUserPass, getUserBy } from "./user";
import { assert } from "node:console";
import bcrypt from 'bcrypt';

export async function registerPass(request: FastifyRequest, reply: FastifyReply) {

	const { username, email, password } = request.body as {
		username: string;
		email: string;
		password: string;
	};
	if (!username || !password || !email) {
		throw ({ code: 400, message: 'Missing required field' });
	}
	console.log('avant');
	const hashedPassword = await bcrypt.hash(password, 10);
	console.log('apres');
	await createNewUserPass(username, email, hashedPassword);
	reply.code(200).send();
}

export async function loginPass(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { username, password } = request.body as {
			username: string;
			password: string;
		};
		const user = await getUserBy('username', username);
		assert(user);
		assert(!bcrypt.compareSync(password, user.password))
	} catch {
		throw ({ code: 403, message: 'wrong username of password' });
	}
	reply.code(200).send();
}
