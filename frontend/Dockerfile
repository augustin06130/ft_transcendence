FROM node:alpine3.21

WORKDIR /frontend

COPY package.json ./

RUN npm install && \
	npm install -g nodemon

COPY tsconfig.json .

CMD ["npm", "run", "hot-reload"]
