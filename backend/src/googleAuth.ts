import { FastifyReply, FastifyRequest } from 'fastify';
import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client();
import { TokenPayload } from 'google-auth-library';
import { fastify, onlineUserStatus } from './main';
import { createNewUser, getUserBy } from './user';

export async function handleGoogle(request: FastifyRequest, reply: FastifyReply) {
	const { credential, g_csrf_token } = request.body as {
		credential: string;
		g_csrf_token: string;
	};
	const g_csrf_token_cookies = request.cookies.g_csrf_token;
	if (!credential) {
		throw { code: 400, message: 'No credential in post body.' };
	} else if (!g_csrf_token) {
		throw { code: 400, message: 'No CSRF token in post body.' };
	} else if (!g_csrf_token_cookies) {
		throw { code: 400, message: 'No CSRF token in Cookie.' };
	} else if (g_csrf_token !== g_csrf_token_cookies) {
		throw { code: 400, message: 'Failed to verify double submit cookie.' };
	}

	const googlePayload = (await verifyGoogleCredential(credential)) as {
		given_name: string;
		email: string;
		sub: string;
	};
	if (!googlePayload) throw { code: 400, message: 'Undefined google sign-in payload' };

	if (!(await getUserBy('googleId', googlePayload.sub))) {
		await addUser(googlePayload.given_name, googlePayload.email, googlePayload.sub);
	}
	await loginUser(googlePayload.sub, reply);
}

export async function verifyGoogleCredential(token: string): Promise<TokenPayload> {
	const ticket = await client.verifyIdToken({
		idToken: token,
		audience: process.env.GOOGLE_WEB_CLIENT_ID,
	});
	const payload = ticket.getPayload();
	if (!payload) throw { code: 400, message: 'Undefined google sign-in payload' };
	return payload;
}

export async function addUser(username: string, email: string, googleId: string) {
	let generatedName = username;
	while (await getUserBy('username', generatedName)) {
		generatedName =
			username +
			Math.floor(Math.random() * 9999)
				.toString()
				.padStart(4, '0');
	}
	await createNewUser(generatedName, email, googleId);
}

export async function loginUser(googleId: string, reply: FastifyReply) {
	const user = await getUserBy('googleId', googleId);
	if (!user) {
		throw { code: 403, message: 'User not found' };
	}
	const token = fastify.jwt.sign({ googleId: user.googleId, username: user.username });

	if (user.username in onlineUserStatus) {
		onlineUserStatus[user.username].status = 'online';
	}

	reply.setCookie('username', user.username, {
		path: '/',
		sameSite: 'strict',
		maxAge: 3600,
	});
	reply.setCookie('googleId', user.googleId, {
		path: '/',
		sameSite: 'strict',
		maxAge: 3600,
	});
	reply.setCookie('jwt', token, {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		maxAge: 3600,
	});
	reply.redirect('/profile');
}

export async function logoutUser(request: FastifyRequest, reply: FastifyReply) {
	const username = (request.user as any)?.username
	if (!username) {
		throw { code: 400, message: 'User not found' };
	}

	if (username in onlineUserStatus) {
		delete onlineUserStatus[username];
	}

	reply.setCookie('jwt', '', {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		expires: new Date(Date.now() - 1000),
	});
	reply.setCookie('username', '', { path: '/', expires: new Date(Date.now() - 1000) });
	reply.setCookie('googleId', '', { path: '/', expires: new Date(Date.now() - 1000) });
	return reply.status(200).send({ success: true });
}

// export async function verifyClikCode(request: FastifyRequest, reply: FastifyReply) {
// 	const url = new URL('https://oauth2.googleapis.com/token');
//     url.searchParams.set('client_id', process.env.GOOGLE_WEB_CLIENT_ID as string);
//     url.searchParams.set('client_secret', process.env.GOOGLE_CLI_SECRET as string);
//     url.searchParams.set('client_secret', process.env.GOOGLE_CLI_SECRET as string);
// 	fetch('')
// }
