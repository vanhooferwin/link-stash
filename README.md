# Link Stash - Bookmark & API Dashboard

A powerful, self-hosted bookmark and API management dashboard designed for developers, sysadmins, and power users. Organize all your important links, monitor service health in real-time, and execute API calls—all from one beautiful glass-effect interface.

![Dashboard Preview](https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop)

## Why Link Stash?

Managing dozens of internal tools, APIs, monitoring dashboards, and documentation links is a daily challenge. Link Stash solves this by providing:

- **One central hub** for all your bookmarks and API endpoints
- **Real-time health monitoring** to know when services go down
- **Quick access** via command palette (Ctrl/Cmd+K)
- **Zero database required** - simple YAML file storage
- **Easy deployment** with Docker Compose

## Features

### Bookmark Management

| Feature | Description |
|---------|-------------|
| **Unlimited Bookmarks** | Organize as many links as you need |
| **Custom Icons** | Choose from 80+ Lucide icons for visual recognition |
| **Color Coding** | Assign colors to quickly identify bookmark types |
| **Descriptions** | Add context to remember what each link is for |
| **Grid Positioning** | True 2D drag-and-drop placement in edit mode |

### Category Organization

- **Collapsible Categories** - Keep your dashboard clean by collapsing unused sections
- **Custom Column Layouts** - Set 2-8 columns per category to fit your content
- **Drag & Drop Reordering** - Reorganize categories and items with ease
- **Visual Separation** - Each category has its own grid for clear organization

### Health Monitoring

Link Stash can automatically monitor the availability of your bookmarked services:

| Capability | Details |
|------------|---------|
| **Automatic Checks** | Configurable interval (default: 60 seconds) |
| **Visual Indicators** | Green (online), Red (offline), Gray (unknown) |
| **Self-Signed Certificates** | Full support for internal HTTPS services |
| **Basic Authentication** | Monitor protected endpoints with credentials |
| **Custom Status Codes** | Expect 200, 301, 401, or any status you need |
| **Smart Fallback** | Automatically uses GET if HEAD isn't supported |

### API Call Templates

Save and execute API calls directly from your dashboard:

- **All HTTP Methods** - GET, POST, PUT, PATCH, DELETE
- **Custom Headers** - Add authorization tokens, content types, etc.
- **Request Body** - JSON body support for POST/PUT/PATCH
- **Response Viewer** - See status, headers, and formatted body
- **Copy to Clipboard** - Easily copy responses for use elsewhere

### Beautiful UI

- **Glass Effect Design** - Modern frosted glass aesthetic
- **Custom Backgrounds** - Set any image URL as your backdrop
- **Brightness & Opacity Controls** - Tune the look to your preference
- **Dark Mode** - Easy on the eyes, especially for monitoring dashboards
- **Command Palette** - Press Ctrl/Cmd+K to instantly search everything

### Data Management

- **Import/Export** - Backup and restore your entire configuration
- **YAML Storage** - Human-readable data format, easy to edit manually
- **No Database Required** - Just a single YAML file
- **Volume Mount Ready** - Persist data with Docker volumes

## Quick Start

### Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/link-stash.git
   cd link-stash
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env and set a secure SESSION_SECRET
   ```

3. **Start the application**
   ```bash
   docker compose up -d
   ```

4. **Access the dashboard**
   Open http://localhost:3005 in your browser

### Using GitHub Container Registry

```yaml
services:
  link-stash:
    image: ghcr.io/yourusername/link-stash:latest
    ports:
      - "3005:3005"
    volumes:
      - ./data:/app/data
    environment:
      - SESSION_SECRET=your-secure-secret-here
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SESSION_SECRET` | Secret for session encryption | Required |
| `DATA_DIR` | Directory for YAML data storage | `./data` |
| `PORT` | Server port | `3005` |

### Data Storage

All data is stored in a single YAML file at `data/bookmarks.yaml`. This file contains:

- Categories and their settings
- All bookmarks with icons, colors, and health check config
- API call templates with headers and body
- Application settings (background, intervals, etc.)

You can manually edit this file or use the import/export feature in the UI.

## Usage Guide

### Adding Your First Bookmark

1. Click the **"Edit Mode"** toggle in the sidebar
2. Click the **"+"** button on any category
3. Fill in the name, URL, and optionally select an icon and color
4. Enable health check if you want to monitor availability
5. Click **Save**

### Setting Up Health Checks

For each bookmark, you can configure:

- **Enable Health Check** - Toggle monitoring on/off
- **Expected Status** - What HTTP status indicates "online" (default: 200)
- **Allow Self-Signed** - Accept untrusted HTTPS certificates
- **Basic Auth** - Username/password for protected endpoints

### Creating API Call Templates

1. In edit mode, click the API tab or add an API call to a category
2. Enter the endpoint URL and select the HTTP method
3. Add headers as needed (e.g., `Authorization: Bearer token`)
4. For POST/PUT requests, add the JSON body
5. Click the play button to execute and see the response

### Customizing the Background

1. Open **Settings** from the sidebar
2. Paste any image URL in the background field
3. Adjust brightness and opacity sliders
4. Changes save automatically

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  Dashboard  │  │   Modals    │  │ Command Palette │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└────────────────────────────┬────────────────────────────┘
                             │ REST API
┌────────────────────────────┴────────────────────────────┐
│                    Backend (Express)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Routes    │  │   Storage   │  │  Health Checks  │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────┐
│                   data/bookmarks.yaml                    │
└─────────────────────────────────────────────────────────┘
```

### Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Storage**: YAML file (js-yaml)
- **Build**: Vite, esbuild

## API Reference

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| POST | `/api/categories` | Create a category |
| PATCH | `/api/categories/:id` | Update a category |
| DELETE | `/api/categories/:id` | Delete a category |
| POST | `/api/categories/reorder` | Reorder categories |

### Bookmarks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookmarks` | List all bookmarks |
| GET | `/api/bookmarks/:id` | Get a bookmark |
| POST | `/api/bookmarks` | Create a bookmark |
| PATCH | `/api/bookmarks/:id` | Update a bookmark |
| DELETE | `/api/bookmarks/:id` | Delete a bookmark |
| POST | `/api/bookmarks/:id/health` | Run health check |
| POST | `/api/bookmarks/reorder` | Reorder bookmarks |

### API Calls

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/api-calls` | List all API calls |
| POST | `/api/api-calls` | Create an API call |
| PATCH | `/api/api-calls/:id` | Update an API call |
| DELETE | `/api/api-calls/:id` | Delete an API call |
| POST | `/api/api-calls/:id/execute` | Execute an API call |

### Settings & Utilities

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get application settings |
| PATCH | `/api/settings` | Update settings |
| GET | `/api/export` | Export all data as JSON |
| POST | `/api/import` | Import data from JSON |

## Roadmap

- [ ] Multi-user support with authentication
- [ ] Notification alerts for service outages
- [ ] SSL certificate expiry monitoring
- [ ] Uptime history and graphs
- [ ] Bookmark folders/tags
- [ ] Browser extension for quick saves
- [ ] Mobile-responsive improvements

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT License - feel free to use this project for personal or commercial purposes.

---

**Link Stash** - Your bookmarks, APIs, and service health—all in one place.
