IMAGE_NAME = quiz-app
DOCKER_USER = pritomash

build:
	docker compose build

up:
	docker compose up

push: build
	docker compose push
