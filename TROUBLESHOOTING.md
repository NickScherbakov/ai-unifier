# Troubleshooting Guide

This guide helps you resolve common issues when working with the AI Unifier platform.

## Build Issues

### TypeScript Compilation Errors

**Problem:** TypeScript compilation fails with module resolution errors.

**Solution:**
```bash
# Clean build artifacts
cd backend && rm -rf dist node_modules
npm install
npm run build

# Check TypeScript version
npx tsc --version  # Should be 5.9.3+
```

### Missing Dependencies

**Problem:** Build fails with "Cannot find module" errors.

**Solution:**
```bash
# Install all dependencies from root
cd /path/to/ai-unifier
npm install

# Verify workspace setup
npm ls --depth=0
```

## Runtime Issues

### Redis Connection Errors

**Problem:** `Redis connection failed` or `ECONNREFUSED localhost:6379`

**Solution:**
1. Check if Redis is running:
   ```bash
   docker ps | grep redis
   # Or if running locally:
   redis-cli ping  # Should return PONG
   ```

2. Start Redis with Docker:
   ```bash
   docker run -d -p 6379:6379 redis:7
   ```

3. Verify Redis URL in `.env`:
   ```env
   REDIS_URL=redis://localhost:6379
   ```

### Database Connection Errors

**Problem:** `Database connection failed` or PostgreSQL errors.

**Solution:**
1. Check if PostgreSQL is running:
   ```bash
   docker ps | grep postgres
   ```

2. Start PostgreSQL with Docker:
   ```bash
   docker run -d -p 5432:5432 \
     -e POSTGRES_USER=ai_unifier \
     -e POSTGRES_PASSWORD=password \
     -e POSTGRES_DB=ai_unifier \
     postgres:15
   ```

3. Verify DATABASE_URL in `.env`:
   ```env
   DATABASE_URL=postgresql://ai_unifier:password@localhost:5432/ai_unifier
   ```

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::4000`

**Solution:**
```bash
# Find process using the port
lsof -i :4000
# Or on Linux:
netstat -tulpn | grep :4000

# Kill the process
kill -9 <PID>

# Or change the port in .env
PORT=4001
```

## Development Issues

### ESLint Configuration Errors

**Problem:** ESLint fails with configuration errors.

**Solution:**
```bash
# Backend
cd backend
npm run lint:fix

# Frontend
cd frontend
npm run lint:fix

# If issues persist, check .eslintrc.json exists
```

### Hot Reload Not Working

**Problem:** Changes not reflected during development.

**Solution:**
```bash
# Restart dev server
npm run dev

# Clear any caching
rm -rf backend/dist frontend/dist
npm run dev
```

### Import Path Resolution Errors

**Problem:** TypeScript can't resolve `@core/*`, `@utils/*`, etc.

**Solution:**
1. Check `tsconfig.json` has correct path mappings:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@core/*": ["./src/core/*"],
         "@utils/*": ["./src/utils/*"],
         "@db/*": ["./src/db/*"]
       }
     }
   }
   ```

2. Install `tsc-alias`:
   ```bash
   cd backend
   npm install --save-dev tsc-alias
   ```

## Provider Issues

### OpenAI API Errors

**Problem:** `OpenAI API key is required` or authentication errors.

**Solution:**
1. Set API key in `.env`:
   ```env
   OPENAI_API_KEY=sk-...
   ```

2. Verify the key is valid:
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   ```

### Anthropic SDK Errors

**Problem:** `Property 'messages' does not exist on type 'Anthropic'`

**Solution:**
Make sure you have the latest Anthropic SDK:
```bash
cd backend
npm install @anthropic-ai/sdk@latest
```

Current version should be 0.30.1 or higher.

### Provider Not Found

**Problem:** `Provider 'xxx' not found or not registered`

**Solution:**
1. Check if provider is initialized in `backend/src/providers/index.ts`
2. Verify API key is set in `.env`
3. Restart the server after adding new providers

## Docker Issues

### Docker Compose Fails

**Problem:** `docker-compose up` fails or containers exit immediately.

**Solution:**
```bash
# Check logs
docker-compose logs

# Rebuild containers
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Volume Permission Issues

**Problem:** Permission denied errors in Docker containers.

**Solution:**
```bash
# Fix permissions
sudo chown -R $USER:$USER .

# Or run with sudo
sudo docker-compose up
```

## Performance Issues

### Slow API Responses

**Problem:** API requests take too long to complete.

**Solutions:**
1. Enable Redis caching in `.env`:
   ```env
   ENABLE_CACHE=true
   CACHE_TTL_SECONDS=3600
   ```

2. Check provider timeouts:
   ```env
   PROVIDER_TIMEOUT_MS=30000  # 30 seconds
   ```

3. Monitor with metrics endpoint:
   ```bash
   curl http://localhost:4000/metrics
   ```

### High Memory Usage

**Problem:** Node.js process consuming too much memory.

**Solution:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start

# Or set in package.json scripts
"start": "NODE_OPTIONS='--max-old-space-size=4096' node dist/index.js"
```

## Security Issues

### npm audit Warnings

**Problem:** Security vulnerabilities reported by `npm audit`.

**Solution:**
```bash
# Check vulnerabilities
npm audit

# Fix automatically (may cause breaking changes)
npm audit fix

# Or fix specific vulnerabilities
npm update <package-name>
```

### CORS Errors

**Problem:** `Access-Control-Allow-Origin` errors in browser.

**Solution:**
Set CORS origin in `.env`:
```env
CORS_ORIGIN=http://localhost:3000,https://yourdomain.com
```

## Testing Issues

### Tests Not Found

**Problem:** `npm test` reports no tests found.

**Solution:**
This is expected in the current version as tests are not yet implemented. You can run:
```bash
# Build to verify code correctness
npm run build

# Lint to check code style
npm run lint
```

## Getting Help

If you encounter issues not covered here:

1. **Check existing issues:** [GitHub Issues](https://github.com/NickScherbakov/ai-unifier/issues)
2. **Create a new issue:** Include:
   - Operating system and version
   - Node.js version (`node --version`)
   - Error messages and stack traces
   - Steps to reproduce
3. **Join discussions:** [GitHub Discussions](https://github.com/NickScherbakov/ai-unifier/discussions)

## Debugging Tips

### Enable Debug Logging

Set in `.env`:
```env
LOG_LEVEL=debug
ENABLE_LOGGING=true
```

### Check System Health

```bash
# API health check
curl http://localhost:4000/health

# Provider health checks
curl http://localhost:4000/api/v1/providers/health

# Metrics
curl http://localhost:4000/metrics
```

### Monitor Logs

```bash
# Docker Compose logs
docker-compose logs -f

# Or specific service
docker-compose logs -f backend

# Local development
npm run dev  # Logs appear in console
```

## Common Environment Variables

Here's a quick reference of important environment variables:

```env
# Server
NODE_ENV=development
PORT=4000
API_BASE_URL=http://localhost:4000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ai_unifier

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_DB=0

# Security
JWT_SECRET=your-secret-key
API_KEY_SALT=your-salt
ENCRYPTION_KEY=32-character-encryption-key

# Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...

# Features
ENABLE_CACHE=true
ENABLE_PROMETHEUS=true
ENABLE_LOGGING=true
LOG_LEVEL=info

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

---

**Last Updated:** 2025-01-13
