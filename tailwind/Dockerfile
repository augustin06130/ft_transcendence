FROM node:alpine3.21

WORKDIR /frontend

RUN npm install -g tailwindcss @tailwindcss/cli

COPY ./script.sh /

CMD ["sh", "/script.sh"]
