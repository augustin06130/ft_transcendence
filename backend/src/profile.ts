import { FastifyRequest, FastifyReply } from 'fastify';
import { Database } from 'sqlite3';
import bcrypt from 'bcrypt';
import {EditUserInfo, VerifUser} from './db';

declare module '@fastify/session' {
    interface FastifySessionObject {
        username?: string;
        userId?: number;
        id: number;
        // username: string;
        email: string;
        phone: string;
        bio: string;

    }
}

export async function UserProfile(
    username: string,
    userpassword: string,
    request: FastifyRequest,
    reply: FastifyReply,
    db: Database,
    email?: string,
    phone?: string,
    bio?: string,
    profilePicture?: string
) {
    // Vérification de l'authentification de l'utilisateur
    if (!username || !userpassword) {
        return reply.status(400).send({ error: 'Nom d\'utilisateur et mot de passe requis' });
    }

    try {
        const user = await VerifUser(username, db);
        if (user && bcrypt.compareSync(userpassword, user.password)) {
            // Vérifier si l'utilisateur est autorisé à modifier ce profil
            if (request.session.username !== username) {
                return reply.status(403).send({ success: false, message: 'Non autorisé à modifier ce profil' });
            }

            // Hacher le mot de passe si nécessaire
            const hashedPassword = userpassword ? bcrypt.hashSync(userpassword, 10) : user.password;

            // Mettre à jour les informations de l'utilisateur
            await EditUserInfo(
                user.id, // ID de l'utilisateur
                username, // Nom d'utilisateur
                hashedPassword, // Mot de passe haché
                email || user.email, // Email
                profilePicture || null, // Chemin de l'image
                db // Base de données
            );

            // Mettre à jour les autres champs (phone, bio) si nécessaire
            if (phone || bio) {
                const updateFields = [];
                const updateValues = [];
                if (phone) {
                    updateFields.push('phone = ?');
                    updateValues.push(phone);
                }
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


