import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { readFile } from 'node:fs';
import path from 'path';

function getMime(file: string) {
    return [
        { ext: '.html', mime: 'text/html' },
        { ext: '.js', mime: 'text/javascript' },
        { ext: '.css', mime: 'text/css' },
        { ext: '.ico', mime: 'image/vnd.microsoft.icon' },
    ].find(format => file.endsWith(format.ext))?.mime;
}

export default function setupStaticLocations(app: FastifyInstance, routes: string[]) {
    routes.forEach(route => {
        app.get(route, function (_: FastifyRequest, reply: FastifyReply) {
            readFile(path.join(__dirname, '../public', route), (err: any, fileBuffer: any) => {
                reply.header('Content-Type', getMime(route));
                reply.send(err || fileBuffer);
            });
        });
    });

    app.get('/*', (_: FastifyRequest, reply: FastifyReply) => {
        readFile(path.join(__dirname, '../public/index.html'), (err: any, fileBuffer: any) => {
            reply.header('Content-Type', 'text/html');
            reply.send(err || fileBuffer);
        });
    });
}
