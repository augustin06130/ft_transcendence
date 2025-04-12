FROM node:alpine3.21

WORKDIR /frontend

COPY package.json ./

RUN npm install
RUN npm install -g nodemon

# CMD ["sleep", "100000000"]
CMD ["npm", "run", "hot-reload"]
# CMD ["npm", "run", "hot-reload"]
