# # Utiliser une image PHP officielle avec CLI (pas Apache)
FROM php:7.4-cli

# Installer Node.js et TypeScript
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g typescript

# Installer SQLite et PHP PDO SQLite
RUN apt-get update && apt-get install -y sqlite3 libsqlite3-dev && \
    docker-php-ext-install pdo pdo_sqlite

# Copier les fichiers de ton projet dans le conteneur
COPY . /var/www/

# Changer les permissions du répertoire public pour permettre l'écriture
RUN chmod -R 777 /var/www/frontend/public

# Changer le répertoire de travail
WORKDIR /var/www

# Installer les dépendances Node.js dans le dossier frontend
RUN cd frontend && npm install

# Compiler le TypeScript en JavaScript dans le dossier frontend
RUN cd frontend && npm run build

# Exposer le port 80 pour accéder au serveur
EXPOSE 80

# Démarrer le serveur PHP intégré sur le port 80, en servant le contenu du dossier public
CMD ["php", "-S", "0.0.0.0:80", "-t", "/var/www/frontend/public"]
