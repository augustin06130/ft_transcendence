import { openDatabase, setupDatabaseTables as setupDatabase } from './db';
import { startOnlineUserTracking } from './onlineUsers';
import Fastify, { FastifyInstance } from 'fastify';
import addRoutes from './routes';
import registerPlugins from './plugins';
import attachHooks from './hooks';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const port: number = 8080
const host: string = '0.0.0.0';

if (!process.env.SESSION_SECRET) {
	console.error('Missing session sercret');
	process.exit(1);
}

if (!process.env.GOOGLE_WEB_CLIENT_ID) {
	console.error('Missing google id');
	process.exit(1);
}

export const db = openDatabase();

export const fastify: FastifyInstance = Fastify({
	logger: {
		level: 'info',
		transport: {
			target: 'pino-pretty',
			options: {
				messageFormat: '{req.method} [{req.url}]',
				colorize: true,
				singleLine: true,
				translateTime: true,
				ignore: 'pid,hostname,responseTime',
			}
		}
	},
	https: {
		key: fs.readFileSync('/etc/fastify/ssl/key.pem'),
		cert: fs.readFileSync('/etc/fastify/ssl/cert.pem'),
	},
});

const start = async () => {
	try {
		registerPlugins(fastify);
		attachHooks(fastify);
		addRoutes(fastify);
		startOnlineUserTracking();
		await setupDatabase();
		await fastify.listen({ port, host });
		console.log('Server is listening on https://localhost:8080');
	} catch (err) {
		console.error('Error starting server:', err);
		process.exit(1);
	}
};

start();
