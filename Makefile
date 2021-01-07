DOCKER_USERNAME := magicq6265
APP_NAME := hanbok-server
GIT_SHA := $(shell git rev-parse --short HEAD)
IMAGE := ${DOCKER_USERNAME}/${APP_NAME}:${GIT_SHA}

build-and-test: build test

build:
	@echo "Building image.."
	docker build --no-cache --tag ${IMAGE} .
	
# manual-build:
# 	@echo "manually building image"
# 	export $(egrep -v '^#' .env | xargs)  https://gist.github.com/judy2k/7656bfe3b322d669ef75364a46327836 참고
# 	docker build --no-cache --tag ${IMAGE} --build-arg JWT_SECRET=${JWT_SECRET} .

test:
	@echo "Testing the app.."
	docker run --rm ${IMAGE} npm start

push:
	@echo "Pushing image to repository"
	docker push ${IMAGE}

.PHONY: build-and-test build test push