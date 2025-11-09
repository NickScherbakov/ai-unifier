# AI Unifier API Documentation

## Base URL

```
http://localhost:4000/api/v1
```

## Authentication

Most endpoints require authentication. Include your API key in the request headers:

```
Authorization: Bearer YOUR_API_KEY
```

## Common Response Format

### Success Response

```json
{
  "data": { ... },
  "timestamp": "2024-01-09T12:00:00.000Z"
}
```

### Error Response

```json
{
  "error": {
    "message": "Error description",
    "statusCode": 400,
    "timestamp": "2024-01-09T12:00:00.000Z",
    "path": "/api/v1/chat/completions"
  }
}
```

## Endpoints

### Health Check

#### GET /health

Check API health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-09T12:00:00.000Z",
  "uptime": 12345.67,
  "environment": "production"
}
```

---

### Chat Completions

#### POST /api/v1/chat/completions

Create a chat completion request.

**Request Body:**
```json
{
  "provider": "openai",
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "temperature": 0.7,
  "maxTokens": 1000,
  "topP": 1.0,
  "frequencyPenalty": 0.0,
  "presencePenalty": 0.0,
  "stop": null,
  "stream": false,
  "user": "user-123"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| provider | string | No | Provider ID (openai, anthropic, google, auto). Default: auto |
| model | string | Yes | Model name (e.g., gpt-4, claude-3-opus) |
| messages | array | Yes | Array of message objects |
| temperature | number | No | Sampling temperature (0-2). Default: 1.0 |
| maxTokens | number | No | Maximum tokens to generate |
| topP | number | No | Nucleus sampling parameter (0-1) |
| frequencyPenalty | number | No | Frequency penalty (-2 to 2) |
| presencePenalty | number | No | Presence penalty (-2 to 2) |
| stop | string/array | No | Stop sequences |
| stream | boolean | No | Enable streaming. Default: false |
| user | string | No | User identifier for tracking |

**Message Object:**

```json
{
  "role": "system|user|assistant",
  "content": "Message content"
}
```

**Response (Non-Streaming):**
```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1704801600,
  "model": "gpt-4",
  "provider": "openai",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! I'm doing well, thank you for asking."
      },
      "finishReason": "stop"
    }
  ],
  "usage": {
    "promptTokens": 25,
    "completionTokens": 15,
    "totalTokens": 40
  }
}
```

**Response (Streaming):**

Server-sent events (SSE) format:

```
data: {"id":"chatcmpl-123","object":"chat.completion.chunk",...}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk",...}

data: [DONE]
```

**Example:**

```bash
curl -X POST http://localhost:4000/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "provider": "openai",
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Explain quantum computing"}
    ],
    "temperature": 0.7,
    "maxTokens": 500
  }'
```

---

### Text Completions

#### POST /api/v1/completions

Create a text completion (legacy format).

**Request Body:**
```json
{
  "provider": "openai",
  "model": "gpt-3.5-turbo-instruct",
  "prompt": "Once upon a time",
  "temperature": 0.7,
  "maxTokens": 100,
  "topP": 1.0,
  "frequencyPenalty": 0.0,
  "presencePenalty": 0.0,
  "stop": null,
  "stream": false
}
```

**Response:**
```json
{
  "id": "cmpl-123",
  "object": "text.completion",
  "created": 1704801600,
  "model": "gpt-3.5-turbo-instruct",
  "provider": "openai",
  "choices": [
    {
      "text": " there was a kingdom...",
      "index": 0,
      "finishReason": "stop"
    }
  ],
  "usage": {
    "promptTokens": 4,
    "completionTokens": 20,
    "totalTokens": 24
  }
}
```

---

### Embeddings

#### POST /api/v1/embeddings

Generate embeddings for text.

**Request Body:**
```json
{
  "provider": "openai",
  "model": "text-embedding-ada-002",
  "input": "The quick brown fox jumps over the lazy dog"
}
```

**Response:**
```json
{
  "object": "list",
  "model": "text-embedding-ada-002",
  "provider": "openai",
  "data": [
    {
      "object": "embedding",
      "embedding": [0.123, -0.456, ...],
      "index": 0
    }
  ],
  "usage": {
    "promptTokens": 10,
    "totalTokens": 10
  }
}
```

---

### Providers

#### GET /api/v1/providers

List all available providers.

**Response:**
```json
{
  "providers": [
    {
      "id": "openai",
      "name": "OpenAI",
      "type": "multimodal",
      "capabilities": {
        "supportsStreaming": true,
        "supportsImages": true,
        "supportsAudio": true,
        "supportsVideo": false,
        "supportsFunctions": true,
        "maxTokens": 128000,
        "models": ["gpt-4", "gpt-3.5-turbo", ...]
      }
    },
    {
      "id": "anthropic",
      "name": "Anthropic",
      "type": "llm",
      "capabilities": { ... }
    }
  ]
}
```

#### GET /api/v1/providers/:id

Get details for a specific provider.

**Response:**
```json
{
  "id": "openai",
  "name": "OpenAI",
  "type": "multimodal",
  "capabilities": { ... }
}
```

#### GET /api/v1/providers/:id/health

Check health status of a provider.

**Response:**
```json
{
  "status": "healthy",
  "latency": 245,
  "lastChecked": "2024-01-09T12:00:00.000Z",
  "message": "OpenAI API is operational"
}
```

---

### Metrics

#### GET /metrics

Prometheus metrics endpoint.

**Response:**

```
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="POST",route="/api/v1/chat/completions",status_code="200"} 1234

# HELP provider_requests_total Total number of provider requests
# TYPE provider_requests_total counter
provider_requests_total{provider="openai",model="gpt-4",status="success"} 500
...
```

---

## Rate Limiting

Rate limits are applied per API key:

- **Default**: 100 requests per minute
- **Custom limits** can be configured per key

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704801660
```

When rate limit is exceeded:

```json
{
  "error": {
    "message": "Rate limit exceeded. Please try again later.",
    "statusCode": 429,
    "retryAfter": 60
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid or missing API key |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 502 | Bad Gateway - Provider error |
| 503 | Service Unavailable |

---

## Supported Models

### OpenAI

- **GPT-4**: gpt-4, gpt-4-turbo-preview, gpt-4-32k
- **GPT-3.5**: gpt-3.5-turbo, gpt-3.5-turbo-16k
- **Embeddings**: text-embedding-ada-002, text-embedding-3-small

### Anthropic

- **Claude 3**: claude-3-opus-20240229, claude-3-sonnet-20240229, claude-3-haiku-20240307
- **Claude 2**: claude-2.1, claude-2.0
- **Claude Instant**: claude-instant-1.2

### Google

- **Gemini**: gemini-pro, gemini-pro-vision
- **PaLM**: text-bison-001, chat-bison-001

---

## Best Practices

1. **Use Streaming** for better UX with long responses
2. **Set maxTokens** to control costs
3. **Handle Errors** gracefully with retry logic
4. **Monitor Usage** via the dashboard
5. **Cache Responses** when appropriate
6. **Use Auto Provider** for automatic failover
7. **Implement Exponential Backoff** for retries

---

## SDKs

### JavaScript/TypeScript

```javascript
import { AIUnifier } from '@ai-unifier/sdk';

const client = new AIUnifier({
  apiKey: 'YOUR_API_KEY',
  baseUrl: 'http://localhost:4000'
});

const response = await client.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

### Python

```python
from ai_unifier import AIUnifier

client = AIUnifier(
    api_key='YOUR_API_KEY',
    base_url='http://localhost:4000'
)

response = client.chat.completions.create(
    model='gpt-4',
    messages=[{'role': 'user', 'content': 'Hello!'}]
)
```

---

## WebSocket Support (Coming Soon)

Real-time bidirectional communication:

```javascript
const ws = new WebSocket('ws://localhost:4000/ws');

ws.send(JSON.stringify({
  type: 'chat',
  model: 'gpt-4',
  messages: [...]
}));

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
};
```

---

## Webhooks (Coming Soon)

Configure webhooks for events:

- Request completed
- Provider failed
- Rate limit exceeded
- Cost threshold reached

---

## Support

For API support:
- GitHub Issues: https://github.com/NickScherbakov/ai-unifier/issues
- Documentation: https://github.com/NickScherbakov/ai-unifier/docs
- Discord: Coming soon
