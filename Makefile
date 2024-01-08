DOCKER_TAG=aac/web:1.0
DOCKER_FILE=Dockerfile
DOCKER_FILE_TEST=Dockerfile.test

default:docker

# cosd-web 镜像
docker:
	docker build -t ${DOCKER_TAG} -f ${DOCKER_FILE} .
.PHONY: docker

# cosd-web 镜像
test:
	docker build -t ${DOCKER_TAG} -f ${DOCKER_FILE_TEST} .
.PHONY: test
