CONTAINER_IMAGE_NAME = transcendence
CONTAINER_NAME = transcendence
COMPOSE_FILE        = docker-compose.dev.yml

run:
	docker compose -f $(COMPOSE_FILE) up

prod:
	docker compose -f docker-compose.prod.yml up --build

build:
	docker compose -f $(COMPOSE_FILE) build

down:
	docker compose -f $(COMPOSE_FILE) down

re:
	docker compose -f $(COMPOSE_FILE) down
	docker compose -f $(COMPOSE_FILE) up --build

rre: fclean
	docker compose -f $(COMPOSE_FILE) up --build

clean:
	docker ps -aq | xargs docker rm -f
	docker image ls -q | xargs docker image rm -f

fclean: clean
	docker system prune -af --volumes
	docker network prune -f
	docker volume prune -f

rm:
	rm -rf */node_modules */package-lock.json ./frontend/public/output.css ./frontend/public/bundle.js
