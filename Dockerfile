FROM node:16.18.0-alpine3.16 as builder
WORKDIR /opt/cosd/backend_game

COPY . /opt/cosd/backend_game
RUN npm install node-sass@8.0.0
RUN rm -rf dist && npm install && npm run build

FROM nginx
COPY --from=builder /opt/cosd/backend_game/dist  /usr/share/nginx/html/
WORKDIR /usr/share/nginx/html
RUN chmod -R a+rx *
