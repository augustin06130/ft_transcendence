import { FastifyRequest, FastifyReply } from 'fastify';

export async function logoutUser(
	request: FastifyRequest,
	reply: FastifyReply
  ) {
	try {
	  if ((request.user as any).username) {
		// return reply.status(200).send({ success: true, message: 'Déconnexion réussie' });
		reply.setCookie('jwt', '', { httpOnly: true, sameSite: 'strict' });
		reply.setCookie('username', '');
		return reply.status(200).send({ success: true });
	  } else {
		return reply.status(400).send({ error: 'Aucun utilisateur connecté' });
	  }
	} catch (err) {
	  console.error('Erreur lors de la déconnexion :', err);
	  return reply.status(500).send({ error: 'Erreur interne du serveur' });
	}
  }
