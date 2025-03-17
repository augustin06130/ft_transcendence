import { FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import {CheckUserExists, CreateNewUser} from './db';
import { Database } from 'sqlite3';

declare module '@fastify/session' {
    interface FastifySessionObject {
        username?: string;
    }
}

export async function NewUser(
    username: string, 
    password: string,
    reply: FastifyReply,
    db: Database
) {
      if (!username || !password) {
        return reply.status(400).send({ error: 'Nom d\'utilisateur et mot de passe requis' });
      }
      try {
        const userExists = await CheckUserExists(username, db);
        if (userExists) {
          return reply.status(400).send({ error: 'Cet utilisateur existe déjà.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await CreateNewUser(username, hashedPassword, db);
  
        return reply.redirect('./index.html');
      } catch (err) {
        console.error('Erreur lors de l\'inscription :', err);
        return reply.status(500).send({ error: 'Erreur interne du serveur' });
      }
    
}