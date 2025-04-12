FROM node:alpine3.21

RUN apk update && \
	apk upgrade && \
	apk add --no-cache sqlite openssl

RUN npm install -g nodemon ts-node

RUN mkdir -p /etc/fastify/ssl && \
	openssl req -x509 -nodes -out /etc/fastify/ssl/cert.pem -keyout /etc/fastify/ssl/key.pem -subj "/C=FR/ST=IDF/L=Paris/O=42/OU=42/CN=ale-tell.42.fr/UID=ale-tell"

EXPOSE 8080

WORKDIR /backend

CMD ["sh", "-c", "npm i && npm run hot-reload"]
