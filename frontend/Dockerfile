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

# add app to build
COPY . ./
RUN npm run build

##############################################################
# production environment
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install serve -g

# Copy build artifacts from build image
COPY --from=build /app/build /app/build/

# run npm start from package json
CMD ["npm","start"] 
