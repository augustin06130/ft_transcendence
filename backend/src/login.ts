import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import { verifUser } from './user';
import { fastify } from './main';

// export async function loginPassword(
// 	request: FastifyRequest,
// 	reply: FastifyReply,
// ) {
// 	const { username, password } = request.body as { username: string; password: string };
//
// 	if (!username || !password) {
// 		return reply.status(400).send({ error: 'Nom d\'utilisateur et mot de passe requis' });
// 	}
// 	try {
// 		const user = await verifUser(username);
// 		if (user && bcrypt.compareSync(password, user.password)) {
// 			return login(username, reply)
// 		} else {
// 			return reply.status(403).send({ success: false });
// 		}
// 	} catch (err) {
// 		return reply.status(400).send('Error during credential verification: ' + err);
// 	}
// }

export async function loginGoogle(
	username: string,
	reply: FastifyReply,
) {
	try {
		const user = await verifUser(username);
		if (user) {
			return login(username, reply)
		} else {
			return reply.status(403).send({ success: false });
		}
	} catch (err) {
		return reply.status(400).send('Error during credential verification: ' + err);
	}
}

function login(username: string, reply: FastifyReply) {
	const token = fastify.jwt.sign({ username });
	reply.setCookie('username', username, { path: '/', sameSite: 'strict', maxAge: 3600 });
	reply.setCookie('jwt', token, { path: '/', httpOnly: true, sameSite: 'strict', maxAge: 3600 });
	reply.status(200).send({ success: true });
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
