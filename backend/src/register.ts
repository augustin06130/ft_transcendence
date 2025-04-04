import { FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import { isUser, createNewUser } from './user';
import { db } from './main';

export async function newUser(
	username: string,
	email: string,
	password: string,
	reply: FastifyReply,
) {
	try {
		if (!username || !password || !email) {
			return reply.status(400).send({ error: 'Missing required field' });
		}
		const userExists = await isUser(username);
		if (userExists) {
			return reply.status(400).send({ error: 'User already exists in databse' });
		}
		const hashedPassword = await bcrypt.hash(password, 10);

		const userId = await createNewUser(username, hashedPassword, email, db);
		console.log(`User created with ID: ${userId}`);

		return reply.status(201).send({ success: true, userId });
	} catch (err) {
		console.error('Erreur lors de l\'inscription :', err);
		return reply.status(500).send({ error: 'Erreur interne du serveur' });
	}
}
