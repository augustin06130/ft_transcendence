import { FastifyReply, FastifyRequest } from 'fastify';
import { OAuth2Client } from 'google-auth-library'
const client = new OAuth2Client();
import { TokenPayload } from 'google-auth-library';
import { newUser } from './register';
import { getUserBy } from './user';
import { loginGoogle } from './login';

export async function verifyGoogleCredential(token: string): Promise<TokenPayload> {
	const ticket = await client.verifyIdToken({
		idToken: token,
		audience: process.env.GOOGLE_WEB_CLIENT_ID,  // Specify the WEB_CLIENT_ID of the app that accesses the backend
	});
	const payload = ticket.getPayload();
	if (!payload)
		throw ('Undenined google singin payload');
	return payload;
	// const userid = payload['sub'];
	// If the request specified a Google Workspace domain:
	// const domain = payload['hd'];
}

export async function handleGoogle(request: FastifyRequest, reply: FastifyReply) {
	const { credential, g_csrf_token } = request.body as { credential: string, g_csrf_token: string }
	const g_csrf_token_cookies = request.cookies.g_csrf_token;
	if (!credential) {
		reply.code(400).send('No credential in post body.');
	}
	else if (!g_csrf_token) {
		reply.code(400).send('No CSRF token in post body.');
	}
	else if (!g_csrf_token_cookies) {
		reply.code(400).send('No CSRF token in Cookie.');
	}
	else if (g_csrf_token !== g_csrf_token_cookies) {
		reply.code(400).send('Failed to verify double submit cookie.');
	}
	if (reply.statusCode === 400)
		return;

	try {
		const googlePayload = (await verifyGoogleCredential(credential)) as { given_name: string, email: string, sub: string };
		if (!googlePayload)
			throw ('Undefined google sign-in payload');
		if (await getUserBy('googleId', googlePayload.sub)) {
			loginGoogle(googlePayload.given_name, reply)
		}
		else {
			if (await getUserBy('email', googlePayload.sub)) {
			} else {
				await newUser(googlePayload.given_name, googlePayload.email, null, googlePayload.sub, reply);
			}
		}
	} catch (err) {
		console.log(err);
	}
}
