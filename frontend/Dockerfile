# syntax=docker/dockerfile:1
# build environment
FROM node:21-alpine AS build

# set working directory in image
WORKDIR /app

# needed for producton?
ENV PATH /app/node_modules/.bin:$PATH

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# update npm to latest
RUN npm install npm@latest -g

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
FROM node:21-alpine
WORKDIR /app

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# update npm to latest
RUN npm install npm@latest -g

COPY package*.json ./
RUN npm install serve -g

# Copy build artifacts from build image
COPY --from=build /app/build /app/build/

EXPOSE $PORT

# run npm start from package json
CMD ["npm","run","serve","--port 3001"]
