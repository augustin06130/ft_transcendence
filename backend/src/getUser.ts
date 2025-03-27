import { FastifyRequest, FastifyReply } from 'fastify';
import { Database } from 'sqlite3';
import { VerifUser } from './db';

declare module '@fastify/session' {
  interface FastifySessionObject {
    username?: string;
    userId?: number;
  }
}

export async function GetCurrentUserData(
  request: FastifyRequest,
  reply: FastifyReply,
  userId: string,
  db: Database
) {
  try {
    // const userId = request.session.userId;

    // const user = await VerifUser(username, db);

    if (!userId) {
      return reply.status(401).send({ error: 'Utilisateur non authentifié' });
    }

    const userData = await db.get(
      `SELECT id, username, email, phone, bio, data
       FROM users 
       WHERE id = ?`, 
      [userId]
    );

    if (!userData) {
      return reply.status(404).send({ error: 'Utilisateur non trouvé' });
    }

    return reply.status(200).send({
      success: true,
      userData
    });

  } catch (err) {
    console.error('Erreur lors de la récupération des données utilisateur :', err);
    return reply.status(500).send({ error: 'Erreur interne du serveur' });
  }
}
