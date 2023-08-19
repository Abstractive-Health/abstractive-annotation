# Abstractive - annotation
This repo is for spinning up a UI on a virtual desktop for annotations
of clinical notes for Abstractive Health

# Deployments
Send/Email Docker Image to many architectures (AMD/ARM64) - See Vince and Ritika

## Installation
1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## Run Docker 
0. The build architecture (AMD64 vs ARM64) matters. Check the `cpu_arch` used for `abstractive-annotations` inside abstractive Infra. If you're running a different architecture, checkout Docker directions for [multi-platform builds]( https://docs.docker.com/build/building/multi-platform/).
1. Run `docker-compose up -d --build` to start
    * `-d` starts up in detached mode
2. Run `docker-compose down` to stop

## Run a Docker Image
1. Run Backend `docker run -p 3000:3000 prod-ah-annotations-backend:latest`
1. Run Frontend `docker run -p 3001:3001 prod-ah-annotations-frontend:latest`
