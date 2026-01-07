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
cd bookmark-dashboard
```

### 2. Configure Environment

Create a `.env` file in the project root:

```bash
# Required: Session secret for secure cookies (use a strong random string)
SESSION_SECRET=your-secure-random-string-here

# Optional: Change the exposed port (default: 5000)
PORT=5000
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
docker compose logs bookmark-dashboard
```

Access the application at: `http://localhost:5000` (or your configured port)

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SESSION_SECRET` | Yes | `changeme-in-production` | Secret key for session encryption |
| `PORT` | No | `5000` | Port to expose the application |
| `DATA_DIR` | No | `/app/data` | Directory for YAML data storage |

### Data Persistence

Bookmark data is stored in a Docker volume named `bookmark-data`. This ensures your data persists across container restarts and updates.

View volume location:

```bash
docker volume inspect bookmark-dashboard_bookmark-data
```

## Management Commands

### View Logs

```bash
# Follow logs in real-time
docker compose logs -f bookmark-dashboard

# View last 100 lines
docker compose logs --tail=100 bookmark-dashboard
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
  -v bookmark-dashboard_bookmark-data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/bookmark-data-$(date +%Y%m%d).tar.gz -C /data .
```

### Restore Data

```bash
# Restore from backup
docker compose down
docker run --rm \
  -v bookmark-dashboard_bookmark-data:/data \
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
        proxy_pass http://localhost:5000;
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
docker compose logs bookmark-dashboard

# Verify the image built correctly
docker compose build --no-cache
```

### Health Check Failing

```bash
# Check if the app responds
curl http://localhost:5000/api/health

# View detailed health status
docker inspect bookmark-dashboard | grep -A 10 Health
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
│  │     bookmark-dashboard container  │  │
│  │                                   │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │   Node.js Express Server    │  │  │
│  │  │   (Port 5000)               │  │  │
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

## Support

For issues and feature requests, please open an issue in the repository.
