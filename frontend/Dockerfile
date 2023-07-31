# Dockerfile is based on the following tutorial:
# https://www.erraticbits.ca/post/2021/fastapi/

# Build step #1: build the React front end
FROM node:20-bookworm-slim as build-step

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY package.json  ./

RUN npm install

COPY ./ ./

RUN npm run build

# Build step #2: build an Caddy container
FROM caddy:alpine

EXPOSE 80
EXPOSE 443

COPY --from=build-step /app/build /usr/share/caddy
