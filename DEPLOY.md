# Bookmark Dashboard - Deployment Guide

This guide explains how to deploy the Bookmark Dashboard application using Docker Compose.

## Prerequisites

- Docker Engine 20.10+ installed
- Docker Compose v2.0+ installed
- Git (to clone the repository)

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd link-stash
```

### 2. Configure Environment

Create a `.env` file in the project root:

```bash
# Required: Session secret for secure cookies (use a strong random string)
SESSION_SECRET=your-secure-random-string-here

# Optional: Change the exposed port (default: 3005)
PORT=3005
```

Generate a secure session secret:

```bash
openssl rand -base64 32
```

### 3. Build and Start

```bash
# Build the Docker image
docker compose build

# Start the application
docker compose up -d
```

### 4. Verify Deployment

Check if the container is running:

```bash
docker compose ps
```

Check container health:

```bash
docker compose logs link-stash
```

Access the application at: `http://localhost:3005` (or your configured port)

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SESSION_SECRET` | Yes | `changeme-in-production` | Secret key for session encryption |
| `PORT` | No | `3005` | Port to expose the application |
| `DATA_DIR` | No | `/app/data` | Directory for YAML data storage |

### Data Persistence

Bookmark data is stored in a Docker volume named `bookmark-data`. This ensures your data persists across container restarts and updates.

View volume location:

```bash
docker volume inspect link-stash_bookmark-data
```

## Management Commands

### View Logs

```bash
# Follow logs in real-time
docker compose logs -f link-stash

# View last 100 lines
docker compose logs --tail=100 link-stash
```

### Stop the Application

```bash
docker compose down
```

### Restart the Application

```bash
docker compose restart
```

### Update to Latest Version

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d
```

## Backup and Restore

### Backup Data

```bash
# Create a backup of the data volume
docker run --rm \
  -v link-stash_bookmark-data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/bookmark-data-$(date +%Y%m%d).tar.gz -C /data .
```

### Restore Data

```bash
# Restore from backup
docker compose down
docker run --rm \
  -v link-stash_bookmark-data:/data \
  -v $(pwd)/backups:/backup \
  alpine sh -c "rm -rf /data/* && tar xzf /backup/bookmark-data-YYYYMMDD.tar.gz -C /data"
docker compose up -d
```

## Production Considerations

### Reverse Proxy (Nginx)

For production deployments, use a reverse proxy for SSL termination:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Security Checklist

- [ ] Set a strong `SESSION_SECRET` (never use the default)
- [ ] Use HTTPS in production with a reverse proxy
- [ ] Keep Docker and the host system updated
- [ ] Regularly backup the data volume
- [ ] Monitor container logs for errors

## Troubleshooting

### Container Won't Start

```bash
# Check logs for errors
docker compose logs link-stash

# Verify the image built correctly
docker compose build --no-cache
```

### Health Check Failing

```bash
# Check if the app responds
curl http://localhost:3005/api/health

# View detailed health status
docker inspect link-stash | grep -A 10 Health
```

### Data Not Persisting

Ensure the volume is properly mounted:

```bash
docker compose down
docker volume ls | grep bookmark
docker compose up -d
```

### Port Already in Use

Change the port in your `.env` file:

```bash
PORT=8080
```

Then restart:

```bash
docker compose down
docker compose up -d
```

## Architecture

```
┌─────────────────────────────────────────┐
│              Docker Host                │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │     link-stash container  │  │
│  │                                   │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │   Node.js Express Server    │  │  │
│  │  │   (Port 3005)               │  │  │
│  │  │                             │  │  │
│  │  │  - Serves React frontend    │  │  │
│  │  │  - REST API endpoints       │  │  │
│  │  │  - YAML file storage        │  │  │
│  │  └─────────────────────────────┘  │  │
│  │              │                     │  │
│  │              ▼                     │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │   /app/data (volume)        │  │  │
│  │  │   - bookmarks.yaml          │  │  │
│  │  │   - settings.yaml           │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │   bookmark-data volume            │  │
│  │   (persistent storage)            │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## GitHub Container Registry (GHCR) Deployment

Instead of building locally, you can push the image to GitHub Container Registry and pull it on your deployment server.

### Setting Up GHCR

#### 1. Create a Personal Access Token (PAT)

1. Go to GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click **Generate new token (classic)**
3. Give it a descriptive name (e.g., "GHCR Push Token")
4. Select these scopes:
   - `write:packages` (push images)
   - `read:packages` (pull images)
   - `delete:packages` (optional, for cleanup)
5. Click **Generate token** and save it securely

#### 2. Build and Push to GHCR (Manual)

```bash
# Set your GitHub username and token
export GITHUB_USER=your-github-username
export CR_PAT=your-personal-access-token

# Login to GHCR
echo $CR_PAT | docker login ghcr.io -u $GITHUB_USER --password-stdin

# Build the image with GHCR tag
docker build -t ghcr.io/$GITHUB_USER/link-stash:latest \
  --label org.opencontainers.image.source=https://github.com/$GITHUB_USER/link-stash .

# Push to GHCR
docker push ghcr.io/$GITHUB_USER/link-stash:latest

# Optionally tag with version
docker tag ghcr.io/$GITHUB_USER/link-stash:latest ghcr.io/$GITHUB_USER/link-stash:v1.0.0
docker push ghcr.io/$GITHUB_USER/link-stash:v1.0.0
```

#### 3. Make the Package Public (Optional)

1. Go to your GitHub profile → **Packages**
2. Click on `link-stash`
3. Go to **Package settings**
4. Under **Danger Zone**, click **Change visibility** and select **Public**

### Automated Builds with GitHub Actions

Create `.github/workflows/docker-publish.yml` for automatic builds on push:

```yaml
name: Build and Push to GHCR

on:
  push:
    branches: [main]
    tags: ['v*']
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GHCR
        if: github.event_name != 'pull_request'
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### Deploy from GHCR

#### Option A: Using docker-compose.ghcr.yml

Use the provided `docker-compose.ghcr.yml` file to pull from GHCR instead of building locally:

```bash
# Set your GitHub username in .env
echo "GITHUB_USER=your-github-username" >> .env

# For private images, login first
echo $CR_PAT | docker login ghcr.io -u $GITHUB_USER --password-stdin

# Deploy using GHCR image
docker compose -f docker-compose.ghcr.yml up -d
```

#### Option B: Modify docker-compose.yml

Replace the `build` section with an `image` reference:

```yaml
services:
  link-stash:
    image: ghcr.io/your-username/link-stash:latest
    # Remove the build section
    # build:
    #   context: .
    #   dockerfile: Dockerfile
```

### Pulling Private Images

If your image is private, authenticate before pulling:

```bash
# On the deployment server
export CR_PAT=your-personal-access-token
echo $CR_PAT | docker login ghcr.io -u your-username --password-stdin

# Then run docker compose
docker compose -f docker-compose.ghcr.yml up -d
```

### Update Workflow (GHCR)

When using GHCR images:

```bash
# Pull the latest image
docker compose -f docker-compose.ghcr.yml pull

# Restart with new image
docker compose -f docker-compose.ghcr.yml up -d
```

### GHCR Image Tags

The GitHub Actions workflow creates these tags automatically:

| Event | Tag Example |
|-------|-------------|
| Push to main | `ghcr.io/user/link-stash:main` |
| Git tag v1.2.3 | `ghcr.io/user/link-stash:1.2.3` |
| Git tag v1.2.3 | `ghcr.io/user/link-stash:1.2` |
| Any commit | `ghcr.io/user/link-stash:sha-abc1234` |

## Support

For issues and feature requests, please open an issue in the repository.
