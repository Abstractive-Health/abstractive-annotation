# syntax=docker/dockerfile:1
# build environment
FROM node:20-alpine AS build

# set working directory in image
WORKDIR /app

# needed for producton?
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies (node_modules) 
# npm ci will remove any previous existing node modules
COPY package*.json ./
RUN npm ci
RUN npm install react-scripts -g
RUN npm install serve -g

# run npm start from package json
CMD ["npm","start"] 
