FROM ubuntu:24.04
MAINTAINER DevOps <devops@kartrocket.com>

# Avoid interactive prompts (e.g. tzdata)
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get update --fix-missing
RUN apt-get install wget vim curl -y

ENV NODE_VERSION=22.19.0
ENV NPM_VERSION=10.9.3
ENV ANGULAR_CLI_VERSION=21.1.4

RUN apt-get install curl -y

RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.38.0/install.sh | bash

ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install $NODE_VERSION
RUN . "$NVM_DIR/nvm.sh" && nvm use $NODE_VERSION
RUN . "$NVM_DIR/nvm.sh" && nvm alias default $NODE_VERSION
ENV PATH="/root/.nvm/versions/node/v$NODE_VERSION/bin/:${PATH}"

RUN node --version
RUN npm --version
RUN npm i -g @angular/cli@$ANGULAR_CLI_VERSION

COPY . /var/www/app
RUN mkdir -p /var/www/app
WORKDIR /var/www/app
