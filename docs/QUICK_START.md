# AI Unifier Quick Start Guide

This guide will help you get AI Unifier up and running in minutes.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ (for local development)
- At least one AI provider API key (OpenAI, Anthropic, etc.)

## Quick Start with Docker (Recommended)

### 1. Clone the Repository

```bash
git clone https://github.com/NickScherbakov/ai-unifier.git
cd ai-unifier
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your AI provider API keys:

```env
# Required: Add at least one provider API key
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Optional: Configure other settings
JWT_SECRET=your-secure-secret-key
API_KEY_SALT=your-secure-salt
ENCRYPTION_KEY=your-32-character-encryption-key
```

### 3. Start the Platform

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database (port 5432)
- Redis cache (port 6379)
- Backend API (port 4000)
- Frontend UI (port 3000)

### 4. Access the Platform

- **Web UI**: http://localhost:3000
- **API**: http://localhost:4000/api/v1
- **API Docs**: http://localhost:4000/api/docs
- **Health Check**: http://localhost:4000/health

### 5. Make Your First API Request

```bash
curl -X POST http://localhost:4000/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ]
  }'
```

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Services

Start PostgreSQL and Redis:

```bash
docker-compose up -d postgres redis
```

Or install them locally.

### 3. Run Database Migrations

```bash
npm run migrate
```

### 4. Start Development Servers

In separate terminals:

```bash
# Backend (http://localhost:4000)
npm run dev:backend

# Frontend (http://localhost:3000)
npm run dev:frontend
```

## Testing Your Setup

### Test Provider Availability

```bash
curl http://localhost:4000/api/v1/providers
```

### Test Health Endpoints

```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/v1/health
```

### Test Chat Completion

```bash
curl -X POST http://localhost:4000/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Explain quantum computing in simple terms"}
    ],
    "temperature": 0.7,
    "maxTokens": 200
  }'
```

### Test Streaming

```bash
curl -X POST http://localhost:4000/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Write a short story"}
    ],
    "stream": true
  }'
```

## Using Different Providers

### OpenAI

```bash
curl -X POST http://localhost:4000/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Your question here"}
    ]
  }'
```

### Anthropic (Claude)

```bash
curl -X POST http://localhost:4000/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "anthropic",
    "model": "claude-3-opus-20240229",
    "messages": [
      {"role": "user", "content": "Your question here"}
    ]
  }'
```

### Auto Provider Selection

Let the platform choose the best available provider:

```bash
curl -X POST http://localhost:4000/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "auto",
    "messages": [
      {"role": "user", "content": "Your question here"}
    ]
  }'
```

## Using the Web UI

1. Open http://localhost:3000 in your browser
2. Navigate through the sidebar:
   - **Dashboard**: View usage statistics and analytics
   - **Providers**: Manage AI provider configurations
   - **Playground**: Test API requests interactively
   - **API Keys**: Generate and manage API keys
   - **Settings**: Configure platform settings

## Common Tasks

### View Logs

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

### Restart Services

```bash
docker-compose restart
```

### Stop Services

```bash
docker-compose down
```

### Update to Latest Version

```bash
git pull
docker-compose pull
docker-compose up -d
```

## Monitoring

### Prometheus Metrics

```bash
curl http://localhost:4000/metrics
```

### Start Monitoring Stack

```bash
docker-compose --profile monitoring up -d
```

Access Grafana at http://localhost:3001 (default: admin/admin)

## Troubleshooting

### Backend Won't Start

Check logs:
```bash
docker-compose logs backend
```

Common issues:
- Missing API keys in `.env`
- Database connection failed
- Port 4000 already in use

### Frontend Won't Load

Check logs:
```bash
docker-compose logs frontend
```

Common issues:
- Backend not running
- Port 3000 already in use
- CORS configuration

### Database Connection Error

Ensure PostgreSQL is running:
```bash
docker-compose ps postgres
```

Check connection string in `.env`:
```env
DATABASE_URL=postgresql://ai_unifier:password@localhost:5432/ai_unifier
```

### Redis Connection Error

Ensure Redis is running:
```bash
docker-compose ps redis
```

Check connection string in `.env`:
```env
REDIS_URL=redis://localhost:6379
```

## Next Steps

- Read the [API Documentation](API.md)
- Explore [Architecture](../ARCHITECTURE.md)
- Learn about [Plugin Development](PLUGIN_DEVELOPMENT.md)
- Review [Security Best Practices](../SECURITY.md)
- Join our community (Discord link coming soon)

## Getting Help

- Check existing [Issues](https://github.com/NickScherbakov/ai-unifier/issues)
- Ask in [Discussions](https://github.com/NickScherbakov/ai-unifier/discussions)
- Read the [Contributing Guide](../CONTRIBUTING.md)

## Clean Up

To completely remove AI Unifier and all data:

```bash
docker-compose down -v
rm -rf node_modules backend/node_modules frontend/node_modules
```

**Warning**: This will delete all data including the database!
