FROM node:alpine3.21

WORKDIR /frontend

COPY package*.json ./

RUN npm install
RUN npm install -g typescript
RUN npm install -g nodemon

CMD ["npm", "run", "hot-reload"]
# CMD ["nodemon", "--watch", "src/", "--exec", "npm run build && npm start --silent"]