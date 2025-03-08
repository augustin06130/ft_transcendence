# Utiliser une image PHP officielle avec CLI (pas Apache)
FROM php:7.4-cli

# Installer Node.js et TypeScript
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g typescript

# Copier les fichiers de ton projet dans le conteneur
COPY . /var/www/html/

# Changer les permissions du répertoire public pour permettre l'écriture
RUN chmod -R 777 /var/www/html/public

# Changer le répertoire de travail
WORKDIR /var/www/html

# Installer les dépendances Node.js
RUN npm install

# Compiler le TypeScript en JavaScript
RUN npm run build

# Exposer le port 80 pour accéder au serveur
EXPOSE 80

# Démarrer le serveur PHP intégré sur le port 80
CMD ["php", "-S", "0.0.0.0:80", "-t", "/var/www/html/public"]
