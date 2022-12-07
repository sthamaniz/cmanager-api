FROM node:12
LABEL maintainer="manpradhan008@gmail.com"

WORKDIR /api

COPY package.json yarn.lock /api/

RUN yarn install

COPY . /api/

CMD yarn dev

EXPOSE 8080