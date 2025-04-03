import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Database } from 'sqlite3';
import bcrypt from 'bcrypt';
import { VerifUser } from './user';

export async function CertifUser(
	request: FastifyRequest,
	reply: FastifyReply,
	db: Database,
	app: FastifyInstance
) {
	const { username, password } = request.body as { username: string; password: string };

	if (!username || !password) {
		return reply.status(400).send({ error: 'Nom d\'utilisateur et mot de passe requis' });
	}
	try {
		const user = await VerifUser(username, db);
		if (user && bcrypt.compareSync(password, user.password)) {
			const token = app.jwt.sign({ username });
			reply.setCookie('username', username, { sameSite: 'strict', maxAge: 3600 });
			reply.setCookie('jwt', token, { httpOnly: true, sameSite: 'strict', maxAge: 3600 });
			return reply.status(200).send({ success: true, user, token });
		} else {
			return reply.status(403).send({ success: false });
		}
	} catch (err) {
		console.error('Error during credential verification: ', err);
		return reply.status(500).send({ error: 'Interal serveur error' });
	}
}
