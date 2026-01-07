# Bookmark Dashboard

## Overview

A productivity-focused bookmark and API call management dashboard built with React and Express. The application allows users to organize bookmarks into categories, perform health checks on bookmarked URLs, and execute API calls with response visualization. Follows a Linear/Notion-inspired modern aesthetic with clean data display and efficient interaction patterns.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful JSON API at `/api/*` endpoints
- **Development**: Vite dev server integration with HMR support

### Data Layer
- **Schema Definition**: Zod schemas in `shared/schema.ts` for validation and type inference
- **Current Storage**: YAML file-based storage (`YamlStorage` class) persisting to `data/bookmarks.yaml`
- **Storage Pattern**: Repository pattern via `IStorage` interface enabling easy swap between storage backends
- **Data Directory**: Configurable via `DATA_DIR` environment variable, defaults to `./data`

## Features

### Categories
- Create, edit, and delete bookmark categories
- Filter bookmarks and API calls by category
- Default "General" category provided

### Bookmarks
- Add bookmarks with name, description, URL, and icon
- Choose from 80+ icons (Lucide icon set)
- Optional health check feature to ping URLs
- Green/red/gray indicators for health status
- Opens in new tab when clicked

### API Calls
- Create API call templates with GET/POST/PUT/DELETE/PATCH methods
- Add custom headers and request body (JSON)
- Execute API calls and view response in modal
- Response modal shows status, headers, and body with copy functionality

### UI Features
- Dark/light mode toggle with localStorage persistence
- Search functionality across bookmarks and API calls
- Responsive grid layout for bookmark/API call cards
- Collapsible sidebar navigation

## API Endpoints

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create a category
- `PATCH /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

### Bookmarks
- `GET /api/bookmarks` - List all bookmarks
- `GET /api/bookmarks/:id` - Get a bookmark
- `POST /api/bookmarks` - Create a bookmark
- `PATCH /api/bookmarks/:id` - Update a bookmark
- `DELETE /api/bookmarks/:id` - Delete a bookmark
- `POST /api/bookmarks/:id/health` - Run health check on bookmark URL

### API Calls
- `GET /api/api-calls` - List all API calls
- `GET /api/api-calls/:id` - Get an API call
- `POST /api/api-calls` - Create an API call
- `PATCH /api/api-calls/:id` - Update an API call
- `DELETE /api/api-calls/:id` - Delete an API call
- `POST /api/api-calls/:id/execute` - Execute an API call and return response

### Health Check
- `GET /api/health/ping?url=<url>` - Ping a URL and return status

## Project Structure

```
client/
  src/
    components/
      ui/              # shadcn/ui components
      app-sidebar.tsx  # Main sidebar navigation
      bookmark-card.tsx
      api-call-card.tsx
      bookmark-modal.tsx
      api-call-modal.tsx
      response-modal.tsx
      category-modal.tsx
      icon-picker.tsx
      dynamic-icon.tsx
      health-indicator.tsx
      method-badge.tsx
      theme-toggle.tsx
    lib/
      theme.tsx        # Theme context provider
      queryClient.ts   # TanStack Query configuration
      utils.ts
    pages/
      dashboard.tsx    # Main dashboard page
    App.tsx
    index.css
server/
  routes.ts           # API route handlers
  storage.ts          # Storage interface and implementation
  index.ts
shared/
  schema.ts           # Zod schemas and types
```

## Development

### Running the App
The app runs with `npm run dev` which starts both the Express server and Vite dev server on port 5000.

### Adding New Features
1. Define schemas in `shared/schema.ts`
2. Update `IStorage` interface in `server/storage.ts`
3. Add API routes in `server/routes.ts`
4. Create React components in `client/src/components/`
5. Wire up with TanStack Query mutations/queries in pages

## Deployment

### Docker Compose Deployment
The application can be deployed using Docker Compose. See `DEPLOY.md` for full instructions.

Quick start:
```bash
# Create .env file with SESSION_SECRET
cp .env.example .env
# Edit .env and set a secure SESSION_SECRET

# Build and run
docker compose build
docker compose up -d
```

### Files
- `Dockerfile` - Multi-stage production build
- `docker-compose.yml` - Container orchestration
- `DEPLOY.md` - Comprehensive deployment guide
- `.env.example` - Environment variable template

## Recent Changes

- Initial implementation of bookmark dashboard MVP
- Categories, bookmarks, and API calls CRUD functionality
- Health check feature for bookmarks
- API call execution with response modal
- Dark/light mode support
- Search and filtering functionality
- Command palette (Ctrl/Cmd+K) for quick search
- Glass effect UI with customizable background images
- Import/export functionality
- Edit mode toggle (view-only by default)
- Docker Compose deployment configuration
