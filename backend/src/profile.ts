import { FastifyRequest, FastifyReply } from 'fastify';
import { Database } from 'sqlite3';
import bcrypt from 'bcrypt';
import {EditUserInfo, VerifUser} from './db';

declare module '@fastify/session' {
    interface FastifySessionObject {
        username?: string;
        userId?: number;
        id: number;
        bio: string;

    }
}

export async function UserProfile(
    username: string,
    request: FastifyRequest,
    reply: FastifyReply,
    db: Database,
    bio?: string,
    profilePicture?: string
) {
    if (!username) {
        return reply.status(400).send({ error: 'Nom d\'utilisateur requis' });
    }

    try {
        const user = await VerifUser(username, db);
        if (user) {
            if (request.session.username !== username) {
                return reply.status(403).send({ success: false, message: 'Non autorisé à modifier ce profil' });
            }
            await EditUserInfo(
                user.id,
                username,
                profilePicture || null,
                db
            );
            if (bio) {
                const updateFields = [];
                const updateValues = [];
                if (bio) {
                    updateFields.push('bio = ?');
                    updateValues.push(bio);
                }

                if (updateFields.length > 0) {
                    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
                    updateValues.push(user.id);
                    await db.run(query, updateValues);
                }
            }

            return reply.status(200).send({ success: true, message: 'Profil mis à jour avec succès', user });
        } else {
            return reply.status(403).send({ success: false, message: 'Authentification échouée' });
        }
    } catch (err) {
        console.error('Erreur lors de la mise à jour du profil :', err);
        return reply.status(500).send({ error: 'Erreur interne du serveur' });
    }
}


