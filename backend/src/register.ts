import { FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import { createNewUser, getDuplicatesUser } from './user';

export async function newUser(
	username: string,
	email: string,
	googleId: string,
	reply: FastifyReply,
) {
	try {
		let err = await checkDuplicates(username, email, googleId);
		if (err) {
			reply.status(409).send({ error: err });
			return
		}

		const userId = await createNewUser(username, email, googleId);
		console.log(`User created with ID: ${userId}`);

		reply.status(201).send({ success: true, userId });
	} catch (err) {
		reply.status(400).send({ error: err });
	}
}

async function checkDuplicates(username: string, email: string, googleId: string | null) {
	const publicatesUser = await getDuplicatesUser(username, email, googleId);
	if (publicatesUser.length === 0) {
		return null;
	}
	if (publicatesUser.find(user => user.username === username)) {
		return 'Username aldready taken';
	}
	else if (publicatesUser.find(user => user.email === email)) {
		return 'Email aldready taken';
	}
	else if (googleId && publicatesUser.find(user => user.googleId === googleId)) {
		return 'GoogleId aldready taken';
	}
	return null;
}
