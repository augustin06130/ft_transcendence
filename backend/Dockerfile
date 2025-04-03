FROM node:alpine3.21

RUN apk update && apk upgrade
RUN apk add --no-cache sqlite

WORKDIR /backend


COPY package*.json ./
COPY ./* /backend/

RUN npm install
RUN npm install -g nodemon
RUN npm install fastify@5.0.0 \
	@fastify/cookie@11.0.0 \
	@fastify/jwt@9.1.0 \
	@fastify/websocket@11.0.2 \
	fastify-static@4.0.0 \
	ws \
	@types/ws \
	sqlite3 \
	sqlite \
	bcrypt

RUN npm install -g typescript @types/node
RUN npm install -g dotenv
# RUN npm install -g ts-node
# RUN npm install --save-dev @types/node

EXPOSE 80

CMD ["npm", "run", "hot-reload"]
