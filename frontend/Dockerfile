FROM node:alpine3.21

WORKDIR /frontend

COPY package*.json ./

RUN npm install

CMD ["npm", "run", "hot-reload"]
