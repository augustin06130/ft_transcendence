import { FastifyReply, FastifyRequest } from 'fastify';
import { getUserBy, setUserBy } from './user';
import { sendSuccess } from './routes';
import speakeasy from 'speakeasy';
import { setJwt } from './auth';
import { User } from './types';
import QRCode from 'qrcode';

export async function enableTfa(request: FastifyRequest, reply: FastifyReply) {
	const id = (request.user as any).id;
	if (!id) throw { code: 403, message: 'user id not found' };
	const secret = speakeasy.generateSecret({
		name: 'ft_transcendence',
	});

	const qrcode = await QRCode.toDataURL(secret.otpauth_url as string, {
		color: {
			light: '#000000',
			dark: '#00ff00',
		},
	});
	await setUserBy('tfaSecret', secret.base32, 'id', id);
	await setUserBy('tfaOn', '0', 'id', id);
	sendSuccess(reply, 200, {
		secret: secret.base32,
		qrcode,
	})
}

export async function verifyTfaToken(id: number, request: FastifyRequest) {
	const { token } = request.body as { token: string }
	if (!token) throw { code: 400, message: 'token not found' };

	const secret = (await getUserBy('id', id)).tfaSecret;
	if (!secret) throw { code: 403, message: '2fa secret not found' };

	const verified = (speakeasy.totp as any).verify({
		encoding: 'base32',
		secret,
		token,
		window: 2,
	});
	if (!verified) throw { code: 401, message: 'Invalid authentication code' };
}

export async function confirmTfa(request: FastifyRequest, reply: FastifyReply) {
	const id = (request.user as any).id;
	if (!id) throw { code: 403, message: 'user id not found' };
	try {
		await verifyTfaToken(id, request);
		setUserBy('tfaOn', '1', 'id', id);
		sendSuccess(reply);
	} catch (err) {
		setUserBy('tfaOn', '0', 'id', id);
		throw { code: 400, message: 'ERROR: wrong code' };
	}
}

export async function loginTfa(request: FastifyRequest, reply: FastifyReply) {
	const id = (request.user as any).id;
	if (!id) throw { code: 403, message: 'user id not found' };

	await verifyTfaToken(id, request);
	setJwt(request.user as User, reply, false);
	reply
		.setCookie('tfa', '0', {
			path: '/',
			sameSite: 'strict',
			secure: true,
		})
	sendSuccess(reply);
}

export async function removeTfa(request: FastifyRequest, reply: FastifyReply) {
	const id = (request.user as any).id;
	if (!id) throw { code: 403, message: 'id not found' };
	setUserBy('tfaOn', '0', 'id', id);
	sendSuccess(reply);
}
