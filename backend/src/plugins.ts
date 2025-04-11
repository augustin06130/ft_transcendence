import fastifyWebsocket from '@fastify/websocket';
import fastifyFormbody from '@fastify/formbody';
import fastifyCookie from '@fastify/cookie';
import { FastifyInstance } from 'fastify';
import fastifyJWT from '@fastify/jwt';

export default function registerPlugins(fastify: FastifyInstance) {
    fastify.register(fastifyWebsocket);
    fastify.register(fastifyFormbody);
    fastify.register(fastifyCookie);
    fastify.register(fastifyJWT, {
        secret: process.env.SESSION_SECRET as string,
        cookie: {
            cookieName: 'jwt',
            signed: false,
        },
    });
}
