# Use Ubuntu 18.04 as the base image
FROM ubuntu:24.04

# Set the maintainer information
MAINTAINER DevOps <devops@kartrocket.com>

# Update package list and upgrade installed packages
RUN apt-get update && apt-get update --fix-missing

# Install necessary packages: wget, vim, curl
RUN apt-get install wget vim curl -y

# Set environment variables for Node.js and NPM versions
#ENV NODE_VERSION=22.5.1
#ENV NPM_VERSION=10.8.2

ENV NODE_VERSION=22.19.0
ENV NPM_VERSION=10.9.3

ENV ANGULAR_CLI_VERSION=21.1.4

# Install curl for NVM installation
RUN apt-get install curl -y

# Install NVM (Node Version Manager)
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.38.0/install.sh | bash

# Set NVM environment variables and install Node.js
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install $NODE_VERSION
RUN . "$NVM_DIR/nvm.sh" && nvm use $NODE_VERSION
RUN . "$NVM_DIR/nvm.sh" && nvm alias default $NODE_VERSION

# Add Node.js and npm to the PATH
ENV PATH="/root/.nvm/versions/node/v$NODE_VERSION/bin/:${PATH}"

# Verify Node.js and npm versions
RUN node --version
RUN npm --version

# Install Angular CLI with the specified version
RUN npm i -g @angular/cli@$ANGULAR_CLI_VERSION

COPY . /var/www/app

# Create a directory for your app
RUN mkdir -p /var/www/app

# Set the working directory
WORKDIR /var/www/app
