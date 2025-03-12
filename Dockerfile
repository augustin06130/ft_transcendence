# # Utiliser une image PHP officielle avec CLI (pas Apache)
FROM php:7.4-cli

# Installer Node.js et TypeScript
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g typescript

RUN apt-get update \
    && apt-get install -y \
    sqlite3 \
    libsqlite3-dev \
    entr \
    && docker-php-ext-install pdo pdo_sqlite

    
# Copier les fichiers de ton projet dans le conteneur
COPY . /var/www/

# COPY ./frontend /var/www/html/frontend

# COPY ./backend /var/www/html/backend

# Changer les permissions du répertoire public pour permettre l'écriture
RUN chmod -R 777 /var/www

# Changer le répertoire de travail
WORKDIR /var/www/

# RUN echo $(ls -la ./frontend/src/**/*)

# Installer les dépendances Node.js dans le dossier frontend
RUN npm install

# Compiler le TypeScript en JavaScript dans le dossier frontend
RUN npm run build

# Exposer le port 80 pour accéder au serveur
EXPOSE 80

# Démarrer le serveur PHP intégré sur le port 80, en servant le contenu du dossier public
CMD ["sh", "-c", "find /var/www/ -type f | entr -r php -S 0.0.0.0:80 -t /var/www/"]
