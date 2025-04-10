import { FastifyReply, FastifyRequest } from 'fastify';
import { getUserBy, setUserBy } from './user';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export async function enableTfa(request: FastifyRequest, reply: FastifyReply) {
    const googleId = (request.body as any).googleId;
    if (!googleId) throw { code: 403, message: 'Google Id not found' };
    const secret = speakeasy.generateSecret({
        name: 'YourWebApp:' + googleId,
    });
    QRCode.toDataURL(secret.otpauth_url as string, (err, dataURL) => {
        if (err) {
            throw { code: 500, message: 'Could not generate QR code' };
        } else {
            reply.send({
                secret: secret.base32,
                qrCode: dataURL,
            });
        }
    });
}

export function verify(token: string, secret: string, window: number = 1) {
    const verified = (speakeasy.totp as any).verify({
        encoding: 'base32',
        secret,
        token,
        window,
    });
    if (!verified) throw { code: 401, message: 'Invalid authentication code' };
}

export async function verifyTfa(request: FastifyRequest, reply: FastifyReply) {
    const { token, secret, googleId } = request.body as {
        token: string;
        secret: string;
        googleId: string;
    };
    verify(token, secret);
    setUserBy('tfa', secret, 'googleId', googleId);
    reply.send();
}

export async function loginTfa(request: FastifyRequest, reply: FastifyReply) {
    const { googleId, token } = request.body as { googleId: string; token: string };
    verify(token, (await getUserBy('googleId', googleId)).tfa, 2);
    reply.send({ success: true });
}
