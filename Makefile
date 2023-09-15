DOCKER_TAG=aac/web:1.0
DOCKER_FILE=Dockerfile

default:docker

# cosd-web 镜像
docker:
	docker build -t ${DOCKER_TAG} -f ${DOCKER_FILE} .
.PHONY: docker
