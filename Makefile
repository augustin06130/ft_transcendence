CONTAINER_IMAGE_NAME = transcendence
OUTPUT_PORT         = 80
COMPOSE_FILE        = docker-compose.yml

run:
	@echo "Starting $(CONTAINER_IMAGE_NAME) at http://localhost:$(OUTPUT_PORT)"
	@docker-compose -f $(COMPOSE_FILE) up

build:
	@docker-compose -f $(COMPOSE_FILE) build

down:
	@docker-compose -f $(COMPOSE_FILE) down

rebuild:
	@docker-compose -f $(COMPOSE_FILE) down
	@docker-compose -f $(COMPOSE_FILE) up --build
