FROM node:alpine3.21

RUN apk update && \
	apk upgrade && \
	apk add --no-cache openssl sqlite

RUN mkdir -p /etc/fastify/ssl && \
	openssl req -x509 -nodes -out /etc/fastify/ssl/cert.pem -keyout /etc/fastify/ssl/key.pem -subj "/C=FR/ST=IDF/L=Paris/O=42/OU=42/CN=ale-tell.42.fr/UID=ale-tell"

WORKDIR /backend

COPY ./package*.json .

RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "run", "start"]
