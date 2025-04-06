import { FastifyReply, FastifyRequest } from 'fastify';
import { OAuth2Client } from 'google-auth-library'
const client = new OAuth2Client();
import { TokenPayload } from 'google-auth-library';
import { fastify } from './main';
import { createNewUser, getUserBy } from './user';

export async function handleGoogle(request: FastifyRequest, reply: FastifyReply) {
	const { credential, g_csrf_token } = request.body as { credential: string, g_csrf_token: string }
	const g_csrf_token_cookies = request.cookies.g_csrf_token;
	if (!credential) {
		return reply.code(400).send('No credential in post body.');
	}
	else if (!g_csrf_token) {
		return reply.code(400).send('No CSRF token in post body.');
	}
	else if (!g_csrf_token_cookies) {
		return reply.code(400).send('No CSRF token in Cookie.');
	}
	else if (g_csrf_token !== g_csrf_token_cookies) {
		return reply.code(400).send('Failed to verify double submit cookie.');
	}

	try {
		const googlePayload = (await verifyGoogleCredential(credential)) as { given_name: string, email: string, sub: string };
		if (!googlePayload)
			throw ('Undefined google sign-in payload');

		if (!(await getUserBy('googleId', googlePayload.sub))) {
			if (!(await addUser(googlePayload.given_name, googlePayload.email, googlePayload.sub, reply)))
				return;
		}
		await loginUser(googlePayload.sub, reply)
	} catch (err) {
		console.log(err);
	}
}

export async function verifyGoogleCredential(token: string): Promise<TokenPayload> {
	const ticket = await client.verifyIdToken({
		idToken: token,
		audience: process.env.GOOGLE_WEB_CLIENT_ID,
	});
	const payload = ticket.getPayload();
	if (!payload)
		throw ('Undefined google singin payload');
	return payload;
}

export async function addUser(
	username: string,
	email: string,
	googleId: string,
	reply: FastifyReply,
) {
	try {
		let generatedName = username;
		while (await getUserBy('username', generatedName)) {
			console.log('Already found:', generatedName);
			generatedName = username + Math.floor(Math.random() * 9999)
				.toString()
				.padStart(4, '0');
		}
		console.log('Selected name:', generatedName);
		await createNewUser(generatedName, email, googleId);
		return true;
	} catch (err) {
		reply.status(400).send({ error: err });
		return false
	}
}

export async function loginUser(
	googleId: string,
	reply: FastifyReply,
) {
	try {
		const user = await getUserBy('googleId', googleId);
		if (user) {
			const token = fastify.jwt.sign({ username: user.username, googleId: user.googleId });
			reply.setCookie('username', user.username, { path: '/', sameSite: 'strict', maxAge: 3600 });
			reply.setCookie('jwt', token, { path: '/', httpOnly: true, sameSite: 'strict', maxAge: 3600 });
			reply.redirect('/profile');
		} else {
			return reply.status(403).send({ success: false });
		}
	} catch (err) {
		return reply.status(400).send('Error during credential verification: ' + err);
	}
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
