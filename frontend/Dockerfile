FROM node:alpine3.21

WORKDIR /frontend

COPY ./package.json .

RUN npm install

COPY . .

CMD ["npm", "run", "start"]
