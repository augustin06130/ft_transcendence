FROM node:alpine3.21

WORKDIR /frontend

COPY package*.json ./
COPY ./* /frontend/

RUN npm install
RUN npm install -g typescript nodemon esbuild@0.25.1 tailwindcss @tailwindcss/cli

CMD ["npm", "run", "hot-reload"]
