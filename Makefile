CONTAINER_IMAGE_NAME = transcendence
OUTPUT_PORT         = 80
COMPOSE_FILE        = docker-compose.yml

run:
	@docker-compose -f $(COMPOSE_FILE) up

build:
	@docker-compose -f $(COMPOSE_FILE) build

down:
	@docker-compose -f $(COMPOSE_FILE) down

rebuild:
	@docker-compose -f $(COMPOSE_FILE) down
	@docker-compose -f $(COMPOSE_FILE) up --build

clean:
	# docker compose down
	docker ps -aq | xargs docker rm -f
	docker image ls -q | xargs docker image rm -f

fclean: clean
	docker system prune -af --volumes
	docker network prune -f
	docker volume prune -f
