# Client Demo Backend

Express API for the SNS Square client demo. The React app lives in a separate repository.

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and set `MONGODB_URI`, `FRONTEND_URL`, and `JWT_SECRET`.

## Run

```bash
npm run dev
```

The API listens on port 5001. Auth routes are under `/api/auth`.

## Docker

```bash
docker build -t client-demo-backend .
docker run -p 5001:5001 --env-file .env client-demo-backend
```

The image does not include `.env`. Pass `MONGODB_URI`, `FRONTEND_URL`, and `JWT_SECRET` at runtime.

## Jenkins

`Jenkinsfile` installs dependencies, builds `client-demo-backend` tagged with the Jenkins build number and `latest`, then checks that the image exists. It does not push the image or start a container. Supply the runtime environment wherever the container is deployed.
