FROM php:7.4-cli

RUN apt-get update \
    && apt-get install -y \
    sqlite3 \
    libsqlite3-dev \
    entr \
    && docker-php-ext-install pdo pdo_sqlite


WORKDIR /backend

EXPOSE 80

CMD ["sh", "-c", "find ./src -type f | entr -r php -S 0.0.0.0:80 -t ./src"]

