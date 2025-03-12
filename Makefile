
CONTAINER_IMAGE_NAME	= transcendence
OUTPUT_PORT		= 8080

build:
	@docker build -t $(CONTAINER_IMAGE_NAME) .

run:
	@echo $(CONTAINER_IMAGE_NAME) http://localhost:$(OUTPUT_PORT)
	@docker run --rm -p $(OUTPUT_PORT):80 -v $(shell pwd):/var/www $(CONTAINER_IMAGE_NAME)
