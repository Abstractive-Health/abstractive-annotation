# Abstractive - annotation
This repo is for spinning up a UI on a virtual desktop for annotations
of clinical notes for Abstractive Health

## Installation
1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## Run Docker 
0. The build architecture (AMD64 vs ARM64) matters. Check the `cpu_arch` used for `abstractive-annotations` inside abstractive Infra. If you're running a different architecture, checkout Docker directions for [multi-platform builds]( https://docs.docker.com/build/building/multi-platform/).
1. Run `docker-compose up -d --build` to start
    * `-d` starts up in detached mode (detached from your terminal window)
2. Run `docker-compose down` to stop

## Run a Docker Image
1. Run Backend `docker run -p 3000:3000 prod-ah-annotations-backend:latest`
1. Run Frontend `docker run -p 3001:3001 prod-ah-annotations-frontend:latest`

# Run docker compose for development (Hot reloading)
`docker-compose -f docker-compose-dev.yml up -d --build`

# Deployments
Send/Email Docker Image to many architectures (AMD/ARM64) - See Vince

## Push to Prod

If the build on github passes and there are no vulnerabilities

1. When ready, push the latest built image up to the corresponding AWS Image Repo: 
    * [prod-ah-useast1-anote-ui](https://us-east-1.console.aws.amazon.com/ecr/repositories/private/578071040470/prod-ah-useast1-anote-ui?region=us-east-1)
    * [prod-ah-useast1-anote-api](https://us-east-1.console.aws.amazon.com/ecr/repositories/private/578071040470/prod-ah-useast1-anote-api?region=us-east-1)
2. Click on the repo then click the button `view push commands`
3. Remember on the second step to specify the file Dockerfile during the build

```
cd frontend
docker build --platform linux/amd64 --build-arg REACT_APP_API_URL="https://anote-api.abstractive.ai" -f Dockerfile -t prod-ah-useast1-anote-ui .
```
```
cd backend
docker build --platform linux/amd64 -f Dockerfile -t prod-ah-useast1-anote-api .
```

4. To see your changes, you have to force a new deployment of [the service]on the EC2 console. Under tasks, you should see the sha-digest of your corresponding image.