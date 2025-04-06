FROM node:alpine3.21

RUN apk update && apk upgrade
RUN apk add --no-cache sqlite openssl

WORKDIR /backend


COPY package*.json ./
COPY ./* /backend/

RUN npm install
RUN npm install -g nodemon typescript @types/node dotenv
RUN npm install fastify@5.0.0 \
	@fastify/cookie@11.0.0 \
	@fastify/jwt@9.1.0 \
	@fastify/websocket@11.0.2 \
	fastify-static@4.0.0 \
	@fastify/formbody@8.0.2 \
	google-auth-library@9.15.1 \
	ws \
	@types/ws \
	sqlite3 \
	bcrypt

RUN mkdir -p /etc/fastify/ssl && \
	openssl req -x509 -nodes -out /etc/fastify/ssl/cert.pem -keyout /etc/fastify/ssl/key.pem -subj "/C=FR/ST=IDF/L=Paris/O=42/OU=42/CN=login.42.fr/UID=ale-tell"

# RUN npm install -g ts-node
# RUN npm install --save-dev @types/node

EXPOSE 80

CMD ["npm", "run", "hot-reload"]
