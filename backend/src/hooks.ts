import { onlineUserStatus } from './onlineUsers';
import { FastifyInstance } from 'fastify';
import { logoutUser } from './auth';
import { getUserBy } from './user';

export default function attachHooks(fastify: FastifyInstance) {
	const authorizedRoutes = new Set([
		'',
		'/*',
		'/favicon.ico',
		'/output.css',
		'/style.css',
		'/bundle.js',
		'/api/register',
		'/api/login/pass',
		'/api/login/google',
		'/api/logout',
		'/api/cookies',
		'/coockie',
		'/register'
	]);

	fastify.addHook('onRequest', async (request, reply) => {
		const route = request.routeOptions.url as string;
		try {
			const jwt: any = await request.jwtVerify({ onlyCookie: true });
			if (jwt.username) {
				if (!(await getUserBy('username', jwt.username)))
					return logoutUser(request, reply);

				onlineUserStatus[jwt.username] = { time: Date.now(), status: 'online' };
			}
			if (route !== '/api/tfa/login' && jwt.tfaOn) {
				if (authorizedRoutes.has(route)) return;
				reply.redirect('/tfa');
			}
		} catch (err) {
			if (authorizedRoutes.has(route)) return;
			console.warn(err);
			reply.redirect('/');
		}
	});

	fastify.addHook('onRequest', (_, reply, done) => {
		reply.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
		reply.header(
			'Content-Security-Policy',
			"script-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/client; frame-src 'self' https://accounts.google.com/gsi/; connect-src 'self' https://accounts.google.com/gsi/;"
		);
		done();
	});
}
