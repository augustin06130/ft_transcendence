FROM node:alpine3.21

WORKDIR /frontend

COPY package*.json ./

RUN npm install
RUN npm install -g typescript nodemon esbuild@0.25.1

CMD ["npm", "run", "hot-reload"]