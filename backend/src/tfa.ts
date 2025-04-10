import { FastifyReply, FastifyRequest } from 'fastify';
import { getUserBy, setUserBy, User } from './user';
import { setJwt } from './googleAuth';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export async function enableTfa(request: FastifyRequest, reply: FastifyReply) {
	const googleId = (request.user as any).googleId;
	if (!googleId)
		throw { code: 403, message: 'googleId not found' }
	const secret = speakeasy.generateSecret({
		name: 'ft_transcendence',
	});

	const qrcode = await QRCode.toDataURL(secret.otpauth_url as string, {
		color: {
			light: "#000000",
			dark: "#00ff00"
		}
	});
	await setUserBy('tfaSecret', secret.base32, 'googleId', googleId);
	await setUserBy('tfaOn', '0', 'googleId', googleId);
	reply.send({
		secret: secret.base32,
		qrcode,
	});

}

export async function verifyTfaToken(googleId: string, request: FastifyRequest) {
	const token = JSON.parse(request.body as string).token;
	if (!token)
		throw { code: 400, message: 'token not found' }

	const secret = (await getUserBy('googleId', googleId)).tfaSecret;
	if (!secret)
		throw { code: 403, message: '2fa secret not found' }


	const verified = (speakeasy.totp as any).verify({
		encoding: 'base32', secret, token, window: 2
	});
	if (!verified)
		throw { code: 401, message: 'Invalid authentication code' };

}

export async function confirmTfa(request: FastifyRequest, reply: FastifyReply) {
	const googleId = (request.user as any).googleId;
	if (!googleId)
		throw { code: 403, message: 'googleId not found' }
	try {
		await verifyTfaToken(googleId, request);
		setUserBy('tfaOn', '1', 'googleId', googleId);
		reply.code(200).send();
	} catch (err) {
		setUserBy('tfaOn', '0', 'googleId', googleId);
		throw err;
	}

}

export async function loginTfa(request: FastifyRequest, reply: FastifyReply) {
	const googleId = (request.user as any).googleId;
	if (!googleId)
		throw { code: 403, message: 'googleId not found' }

	await verifyTfaToken(googleId, request);
	setJwt(request.user as User, reply, false);
	reply.code(200).send();
	// reply.redirect('/profile');
}

export async function removeTfa(request: FastifyRequest, reply: FastifyReply) {
	const googleId = (request.user as any).googleId;
	if (!googleId)
		throw { code: 403, message: 'googleId not found' }
	// verifyTfaToken(googleId, request);
	setUserBy('tfaOn', '0', 'googleId', googleId);
	reply.code(200).send();
}

