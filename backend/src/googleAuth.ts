import { FastifyReply, FastifyRequest } from 'fastify';
import { createNewUserGoogle, getUserBy } from './user';
import { OAuth2Client } from 'google-auth-library';
import { TokenPayload } from 'google-auth-library';
import { loginUser } from "./auth";
const client = new OAuth2Client();

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

	const user = await getUserBy('googleId', googlePayload.sub);
	if (!user) {
		const id = await addUserGoogle(googlePayload.given_name, googlePayload.email, googlePayload.sub);
		await loginUser(id, reply);
	}
	else {
		await loginUser(user.id, reply);
	}
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

export async function addUserGoogle(
	username: string,
	email: string,
	googleId: string,
	deleteDate: number = 0
) {
	let generatedName = username;
	while (await getUserBy('username', generatedName)) {
		generatedName =
			username +
			Math.floor(Math.random() * 9999)
				.toString()
				.padStart(4, '0');
	}
	return await createNewUserGoogle(generatedName, email, googleId, deleteDate);
}

