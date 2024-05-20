# syntax=docker/dockerfile:1
# build environment
FROM node:21-alpine AS build

# set working directory in image
WORKDIR /app

# needed for producton?
ENV PATH /app/node_modules/.bin:$PATH

# update npm to latest
RUN npm install npm@latest -g

# install app dependencies (node_modules) 
# npm ci will remove any previous existing node modules
COPY package*.json ./
RUN npm ci
# copy the rest of your application code
COPY . .
RUN npm install react-scripts -g
RUN npm install serve -g

# run npm start from package json
CMD ["npm","start"] 
