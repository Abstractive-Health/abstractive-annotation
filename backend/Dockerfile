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

# update @svgr/webpack react-scripts dependency to amend nth-check vulnerability
WORKDIR /usr/local/lib/node_modules/react-scripts
RUN npm install @svgr/webpack@8.1.0

# do the same for postcss
WORKDIR /usr/local/lib/node_modules/react-scripts/node_modules/resolve-url-loader
RUN npm install postcss@8.4.31

WORKDIR /app

# busybox vulnerability fix (CVE-2023-42366)
RUN apk update && apk upgrade busybox

ENV PORT=3000
EXPOSE 3000 

# run npm start from package json
CMD ["npm","start"]
