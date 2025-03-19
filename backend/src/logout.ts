import { FastifyRequest, FastifyReply } from 'fastify';

// export async function logoutUser(
//     request: FastifyRequest,
//     reply: FastifyReply
// ) {
//     try {
//         // Vérifiez si l'utilisateur est connecté
//         if (request.session.username) {
//             // Détruire la session
//             request.session.destroy((err) => {
//                 if (err) {
//                     console.error('Erreur lors de la destruction de la session :', err);
//                     return reply.status(500).send({ error: 'Erreur interne du serveur' });
//                 }
//                 return reply.status(200).send({ success: true, message: 'Déconnexion réussie' });
//             });
//         } else {
//             return reply.status(400).send({ error: 'Aucun utilisateur connecté' });
//         }
//     } catch (err) {
//         console.error('Erreur lors de la déconnexion :', err);
//         return reply.status(500).send({ error: 'Erreur interne du serveur' });
//     }
// }


export async function logoutUser(
	request: FastifyRequest,
	reply: FastifyReply
  ) {
	try {
	  // Vérifiez si l'utilisateur est connecté
	  if (request.session.username) {
		// Détruire la session
		await request.session.destroy();
		return reply.status(200).send({ success: true, message: 'Déconnexion réussie' });
	  } else {
		return reply.status(400).send({ error: 'Aucun utilisateur connecté' });
	  }
	} catch (err) {
	  console.error('Erreur lors de la déconnexion :', err);
	  return reply.status(500).send({ error: 'Erreur interne du serveur' });
	}
  }
