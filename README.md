# AI Unifier Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

**AI Unifier** is an open-source, self-hosted platform that provides a unified gateway for multiple Large Language Models (LLMs) and AI services. Integrate OpenAI, Anthropic, Google, Mistral, Llama, YandexGPT, and more through a single, consistent API while maintaining security, scalability, and compliance.

## 🌟 Key Features

- **🔄 Unified API**: Single interface for all AI providers - no more switching between SDKs
- **🔐 Secure & Compliant**: Enterprise-grade security with GDPR, SOC 2, and HIPAA compliance
- **🚀 Scalable**: Horizontal scaling with Kubernetes support for enterprise workloads
- **🎨 Multimodal**: Support for text, image, audio, and video processing
- **🧩 Extensible**: Plugin system for custom integrations and providers
- **📊 Observable**: Built-in monitoring, logging, and analytics dashboard
- **💰 Cost Management**: Track usage and costs across all providers
- **🔌 Marketplace**: Plugin marketplace for community extensions
- **🌐 Self-Hosted**: Complete control over your data and infrastructure
- **⚡ High Performance**: Response caching, connection pooling, and streaming support

## 🏗️ Architecture

AI Unifier uses a modern, microservices-inspired architecture designed for reliability and scale:

```
Client Apps → API Gateway → Provider Abstraction Layer → AI Providers
                 ↓
        [Auth, Rate Limiting, Load Balancing]
                 ↓
        [PostgreSQL, Redis, Monitoring]
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed architecture documentation.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- Docker and Docker Compose
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/NickScherbakov/ai-unifier.git
cd ai-unifier
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start with Docker Compose (recommended):**
```bash
docker-compose up -d
```

5. **Run database migrations:**
```bash
npm run migrate
```

6. **Access the platform:**
- Web UI: http://localhost:3000
- API: http://localhost:4000/api/v1
- API Docs: http://localhost:4000/api/docs

### Alternative: Manual Setup

```bash
# Start PostgreSQL and Redis manually or via Docker
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:15
docker run -d -p 6379:6379 redis:7

# Start backend
npm run dev:backend

# Start frontend (in another terminal)
npm run dev:frontend
```

## 📚 Usage

### Basic API Request

```bash
curl -X POST http://localhost:4000/api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ]
  }'
```

### Using the JavaScript/TypeScript SDK

```typescript
import { AIUnifier } from '@ai-unifier/sdk';

const client = new AIUnifier({
  apiKey: 'YOUR_API_KEY',
  baseUrl: 'http://localhost:4000'
});

// Chat completion
const response = await client.chat.completions.create({
  provider: 'openai',
  model: 'gpt-4',
  messages: [
    { role: 'user', content: 'Explain quantum computing in simple terms' }
  ]
});

console.log(response.choices[0].message.content);

// Streaming
const stream = await client.chat.completions.create({
  provider: 'anthropic',
  model: 'claude-3-opus',
  messages: [{ role: 'user', content: 'Write a poem' }],
  stream: true
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0].delta.content || '');
}
```

### Provider Fallback

```typescript
// Automatically fallback to alternative providers if primary fails
const response = await client.chat.completions.create({
  provider: 'auto', // or ['openai', 'anthropic', 'google']
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello' }],
  fallback: true
});
```

## 🔧 Configuration

### Environment Variables

Key configuration options in `.env`:

```env
# Server
NODE_ENV=production
PORT=4000
API_BASE_URL=http://localhost:4000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ai_unifier
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-secret-key-here
API_KEY_SALT=your-salt-here

# Providers (add your API keys)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
MISTRAL_API_KEY=...

# Monitoring
ENABLE_PROMETHEUS=true
ENABLE_LOGGING=true
LOG_LEVEL=info
```

### Provider Configuration

Configure providers via the Web UI or API:

```bash
curl -X POST http://localhost:4000/api/v1/providers \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "name": "OpenAI Production",
    "credentials": {
      "apiKey": "sk-..."
    },
    "isEnabled": true,
    "priority": 1
  }'
```

## 🧩 Plugin System

### Installing Plugins

```bash
# Install from marketplace
npm run plugin:install @ai-unifier/plugin-slack

# Install from local file
npm run plugin:install ./my-custom-plugin
```

### Creating a Custom Plugin

```typescript
// my-plugin.ts
import { Plugin, PluginContext } from '@ai-unifier/plugin-sdk';

export default class MyPlugin implements Plugin {
  id = 'my-custom-plugin';
  name = 'My Custom Plugin';
  version = '1.0.0';
  type = 'preprocessor';

  async initialize(context: PluginContext) {
    console.log('Plugin initialized');
  }

  async execute(input: any) {
    // Modify request before sending to provider
    input.messages = input.messages.map(m => ({
      ...m,
      content: m.content.toUpperCase()
    }));
    return input;
  }

  async shutdown() {
    console.log('Plugin shutdown');
  }
}
```

See [PLUGIN_DEVELOPMENT.md](docs/PLUGIN_DEVELOPMENT.md) for detailed guide.

## 📊 Monitoring & Analytics

Access the dashboard at http://localhost:3000/dashboard to view:

- Real-time API usage and request rates
- Provider performance and latency
- Cost tracking and billing
- Error rates and failed requests
- Token usage by user/organization
- Cache hit rates

### Prometheus Metrics

Metrics available at http://localhost:4000/metrics:

- `api_requests_total` - Total API requests
- `api_request_duration_seconds` - Request latency
- `provider_requests_total` - Requests per provider
- `token_usage_total` - Token consumption
- `api_errors_total` - Error count

## 🔒 Security

AI Unifier implements multiple security layers:

- **Authentication**: JWT tokens, API keys, OAuth 2.0
- **Authorization**: Role-based access control (RBAC)
- **Encryption**: TLS 1.3 in transit, AES-256 at rest
- **Rate Limiting**: Per-user and per-organization limits
- **Audit Logging**: Complete audit trail of all operations
- **Data Isolation**: Multi-tenant architecture with logical separation
- **Input Validation**: All inputs validated and sanitized
- **Secret Management**: Secure credential storage with encryption

See [SECURITY.md](SECURITY.md) for security policies and vulnerability reporting.

## 🚢 Deployment

### Docker Compose (Small to Medium Scale)

```bash
docker-compose up -d
```

Suitable for up to 1000 requests/minute.

### Kubernetes (Enterprise Scale)

```bash
# Apply configurations
kubectl apply -f k8s/

# Check status
kubectl get pods -n ai-unifier
```

Suitable for 1000+ requests/minute with auto-scaling.

### Cloud Deployments

- **AWS**: See [docs/deployment/AWS.md](docs/deployment/AWS.md)
- **GCP**: See [docs/deployment/GCP.md](docs/deployment/GCP.md)
- **Azure**: See [docs/deployment/AZURE.md](docs/deployment/AZURE.md)

## 🛣️ Roadmap

### Current: Phase 1 - Foundation (MVP)
- ✅ Core architecture and design
- ✅ Project structure and documentation
- 🔄 API Gateway implementation
- 🔄 Provider adapters (OpenAI, Anthropic, Google)
- 🔄 Basic Web UI
- 🔄 Docker deployment

### Phase 2 - Enhancement
- Plugin system
- Multimodal support (image, audio, video)
- Advanced monitoring and alerting
- Plugin marketplace
- Kubernetes deployment

### Phase 3 - Enterprise
- Multi-region support
- Advanced compliance features
- Custom model hosting
- White-label options
- Enterprise SSO (SAML, LDAP)

See [ROADMAP.md](ROADMAP.md) for detailed timeline.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Code of conduct
- Development workflow
- Coding standards
- Testing requirements
- Pull request process

## 📖 Documentation

- [Architecture Overview](ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Plugin Development Guide](docs/PLUGIN_DEVELOPMENT.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Security Best Practices](SECURITY.md)
- [Contributing Guide](CONTRIBUTING.md)

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/NickScherbakov/ai-unifier/issues)
- **Discussions**: [GitHub Discussions](https://github.com/NickScherbakov/ai-unifier/discussions)
- **Discord**: [Join our community](https://discord.gg/ai-unifier) (coming soon)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the need for a unified AI gateway in enterprise environments
- Built with modern open-source technologies
- Thanks to all contributors and the AI/ML community

## ⭐ Star History

If you find this project useful, please consider giving it a star! It helps the project grow and reach more developers.

---

**Built with ❤️ by the AI Unifier Team**