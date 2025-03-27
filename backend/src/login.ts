import { FastifyRequest, FastifyReply } from 'fastify';
import { Database } from 'sqlite3';
import bcrypt from 'bcrypt';
import {VerifUser} from './db';

declare module '@fastify/session' {
    interface FastifySessionObject {
        username?: string;
    }
}

export async function CertifUser(
    username: string,
    userpassword: string,
    request: FastifyRequest,
    reply: FastifyReply,
    db: Database
) {
    if (!username || !userpassword) {
        return reply.status(400).send({ error: 'Nom d\'utilisateur et mot de passe requis' });
      }
    try {
        const user = await VerifUser(username, db);
        if (user && bcrypt.compareSync(userpassword, user.password)) {
            request.session.username = username;
            return reply.status(200).send({ success: true, message: 'connexion reussie', user });
        } else {
            return reply.status(403).send({ success: false, message: 'connexion echouee'});
        }
    } catch(err){
        console.error('Erreur lors de la vérification des identifiants :', err);
        return reply.status(500).send({ error: 'Erreur interne du serveur' });
    }
}


