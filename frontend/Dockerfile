FROM node:alpine3.21

WORKDIR /frontend

COPY package*.json ./

RUN npm install
RUN npm install -g typescript
RUN npm install --save-exact --save-dev esbuild
RUN npm install -g nodemon

CMD ["npm", "run", "hot-reload"]