import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import { verifUser } from './user';

export async function certifUser(
	request: FastifyRequest,
	reply: FastifyReply,
	app: FastifyInstance
) {
	const { username, password } = request.body as { username: string; password: string };

	if (!username || !password) {
		return reply.status(400).send({ error: 'Nom d\'utilisateur et mot de passe requis' });
	}
	try {
		const user = await verifUser(username);
		if (user && bcrypt.compareSync(password, user.password)) {
			const token = app.jwt.sign({ username });
			reply.setCookie('username', username, { path: '/', sameSite: 'strict', maxAge: 3600 });
			reply.setCookie('jwt', token, { path: '/', httpOnly: true, sameSite: 'strict', maxAge: 3600 });
			return reply.status(200).send({ success: true, user, token });
		} else {
			return reply.status(403).send({ success: false });
		}
	} catch (err) {
		console.error('Error during credential verification: ', err);
		return reply.status(500).send({ error: 'Interal serveur error' });
	}
}

export async function logoutUser(
	request: FastifyRequest,
	reply: FastifyReply
) {
	try {
		if ((request.user as any).username) {
			reply.setCookie('jwt', '', { path: '/', httpOnly: true, sameSite: 'strict' });
			reply.setCookie('username', '', { path: '/' });
			return reply.status(200).send({ success: true });
		} else {
			return reply.status(400).send({ error: 'Aucun utilisateur connecté' });
		}
	} catch (err) {
		console.error('Erreur lors de la déconnexion :', err);
		return reply.status(500).send({ error: 'Erreur interne du serveur' });
	}
}
