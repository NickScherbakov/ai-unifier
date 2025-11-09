# Plugin Development Guide

Learn how to extend AI Unifier with custom plugins.

## Overview

Plugins allow you to extend AI Unifier's functionality by:
- Adding new AI provider integrations
- Pre-processing requests before sending to providers
- Post-processing responses before returning to clients
- Integrating with external services (Slack, Discord, webhooks, etc.)

## Plugin Types

### 1. Provider Plugins

Add support for new AI providers.

### 2. Preprocessor Plugins

Transform requests before they reach the provider.

### 3. Postprocessor Plugins

Transform responses before they're returned to clients.

### 4. Integration Plugins

Connect AI Unifier with external systems.

## Plugin Structure

```
my-plugin/
├── package.json
├── src/
│   └── index.ts
├── README.md
└── plugin.yaml
```

## Creating a Plugin

### 1. Plugin Manifest (`plugin.yaml`)

```yaml
id: my-custom-plugin
name: My Custom Plugin
version: 1.0.0
type: preprocessor
description: A custom plugin that does something cool
author: Your Name
repository: https://github.com/yourusername/my-plugin
license: MIT

# Plugin configuration schema
config:
  apiKey:
    type: string
    required: true
    description: API key for the service
  endpoint:
    type: string
    required: false
    default: https://api.example.com
    description: API endpoint URL

# Permissions required
permissions:
  - network
  - storage

# Dependencies
dependencies:
  - axios: "^1.6.0"
```

### 2. Plugin Implementation

```typescript
// src/index.ts
import { Plugin, PluginContext } from '@ai-unifier/plugin-sdk';

export default class MyCustomPlugin implements Plugin {
  id = 'my-custom-plugin';
  name = 'My Custom Plugin';
  version = '1.0.0';
  type = 'preprocessor';

  private context?: PluginContext;

  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    context.logger.info('Plugin initialized');
    
    // Access configuration
    const apiKey = context.config.apiKey;
    
    // Validate configuration
    if (!apiKey) {
      throw new Error('API key is required');
    }
  }

  async execute(input: any): Promise<any> {
    this.context!.logger.info('Processing request');
    
    // Transform the input
    input.messages = input.messages.map(msg => ({
      ...msg,
      content: msg.content.toUpperCase()
    }));
    
    return input;
  }

  async shutdown(): Promise<void> {
    this.context!.logger.info('Plugin shutting down');
  }
}
```

## Plugin SDK Reference

### Plugin Interface

```typescript
interface Plugin {
  id: string;
  name: string;
  version: string;
  type: 'provider' | 'preprocessor' | 'postprocessor' | 'integration';
  
  initialize(context: PluginContext): Promise<void>;
  execute(input: any): Promise<any>;
  shutdown(): Promise<void>;
}
```

### Plugin Context

```typescript
interface PluginContext {
  config: Record<string, any>;
  logger: Logger;
  cache: CacheManager;
  storage: StorageManager;
  http: HttpClient;
}
```

#### Logger

```typescript
context.logger.info('Information message');
context.logger.warn('Warning message');
context.logger.error('Error message');
context.logger.debug('Debug message');
```

#### Cache

```typescript
// Store data in cache
await context.cache.set('key', value, ttl);

// Retrieve from cache
const value = await context.cache.get('key');

// Delete from cache
await context.cache.delete('key');
```

#### Storage

```typescript
// Store persistent data
await context.storage.set('key', value);

// Retrieve data
const value = await context.storage.get('key');

// Delete data
await context.storage.delete('key');
```

#### HTTP Client

```typescript
// Make HTTP requests
const response = await context.http.get('https://api.example.com/data');
const data = await context.http.post('https://api.example.com/data', { body });
```

## Plugin Examples

### Example 1: Text Translator Plugin

```typescript
import { Plugin, PluginContext } from '@ai-unifier/plugin-sdk';
import axios from 'axios';

export default class TranslatorPlugin implements Plugin {
  id = 'translator';
  name = 'Text Translator';
  version = '1.0.0';
  type = 'preprocessor';

  private context?: PluginContext;
  private apiKey?: string;

  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    this.apiKey = context.config.apiKey;
  }

  async execute(input: any): Promise<any> {
    const targetLang = this.context!.config.targetLanguage || 'en';
    
    for (const message of input.messages) {
      if (message.role === 'user') {
        message.content = await this.translate(message.content, targetLang);
      }
    }
    
    return input;
  }

  private async translate(text: string, targetLang: string): Promise<string> {
    const response = await axios.post(
      'https://translation-api.example.com/translate',
      {
        text,
        target: targetLang
      },
      {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      }
    );
    
    return response.data.translatedText;
  }

  async shutdown(): Promise<void> {
    // Cleanup
  }
}
```

### Example 2: Slack Integration Plugin

```typescript
import { Plugin, PluginContext } from '@ai-unifier/plugin-sdk';

export default class SlackPlugin implements Plugin {
  id = 'slack-integration';
  name = 'Slack Integration';
  version = '1.0.0';
  type = 'postprocessor';

  private context?: PluginContext;

  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
  }

  async execute(output: any): Promise<any> {
    // Send response to Slack
    const webhookUrl = this.context!.config.webhookUrl;
    
    if (webhookUrl) {
      await this.context!.http.post(webhookUrl, {
        text: `AI Response: ${output.choices[0].message.content}`
      });
    }
    
    return output;
  }

  async shutdown(): Promise<void> {}
}
```

### Example 3: Custom Provider Plugin

```typescript
import { Plugin, PluginContext } from '@ai-unifier/plugin-sdk';
import axios from 'axios';

export default class CustomProviderPlugin implements Plugin {
  id = 'custom-llm';
  name = 'Custom LLM Provider';
  version = '1.0.0';
  type = 'provider';

  private context?: PluginContext;
  private endpoint?: string;
  private apiKey?: string;

  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    this.endpoint = context.config.endpoint;
    this.apiKey = context.config.apiKey;
  }

  async execute(input: any): Promise<any> {
    const response = await axios.post(
      `${this.endpoint}/chat`,
      {
        messages: input.messages,
        temperature: input.temperature,
        max_tokens: input.maxTokens
      },
      {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      }
    );

    return {
      id: response.data.id,
      object: 'chat.completion',
      created: Date.now(),
      model: input.model,
      provider: this.id,
      choices: response.data.choices,
      usage: response.data.usage
    };
  }

  async shutdown(): Promise<void> {}
}
```

## Testing Plugins

### Unit Tests

```typescript
import MyPlugin from './src/index';

describe('MyPlugin', () => {
  let plugin: MyPlugin;
  let context: MockPluginContext;

  beforeEach(() => {
    plugin = new MyPlugin();
    context = createMockContext({
      apiKey: 'test-key'
    });
  });

  test('should initialize correctly', async () => {
    await plugin.initialize(context);
    expect(plugin).toBeDefined();
  });

  test('should transform input', async () => {
    await plugin.initialize(context);
    const input = { messages: [{ role: 'user', content: 'hello' }] };
    const output = await plugin.execute(input);
    expect(output.messages[0].content).toBe('HELLO');
  });
});
```

### Integration Tests

Test your plugin with the actual AI Unifier platform in a development environment.

## Installing Plugins

### From NPM

```bash
npm run plugin:install @ai-unifier/plugin-slack
```

### From GitHub

```bash
npm run plugin:install https://github.com/username/plugin-name
```

### From Local File

```bash
npm run plugin:install ./my-plugin
```

## Configuring Plugins

### Via API

```bash
curl -X POST http://localhost:4000/api/v1/plugins/my-plugin/config \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "your-api-key",
    "enabled": true
  }'
```

### Via Web UI

1. Navigate to Settings → Plugins
2. Find your plugin
3. Click Configure
4. Enter configuration values
5. Save

### Via Configuration File

```yaml
# config/plugins.yaml
plugins:
  - id: my-custom-plugin
    enabled: true
    config:
      apiKey: your-api-key
      endpoint: https://api.example.com
```

## Publishing Plugins

### 1. Prepare for Publishing

```bash
# Build plugin
npm run build

# Test plugin
npm test

# Update version
npm version patch
```

### 2. Publish to NPM

```bash
npm publish --access public
```

### 3. Submit to Marketplace

Coming soon: Submit your plugin to the AI Unifier Plugin Marketplace for discovery by other users.

## Best Practices

1. **Error Handling**: Always handle errors gracefully
2. **Logging**: Use context.logger for all logging
3. **Configuration**: Validate configuration in initialize()
4. **Performance**: Keep execute() fast and efficient
5. **Security**: Never log sensitive data
6. **Testing**: Write comprehensive tests
7. **Documentation**: Provide clear README and examples
8. **Versioning**: Follow semantic versioning

## Security Considerations

- **Permissions**: Request only necessary permissions
- **Input Validation**: Validate all inputs
- **API Keys**: Store API keys securely in configuration
- **Rate Limiting**: Implement rate limiting for external APIs
- **Sandboxing**: Plugins run in a sandboxed environment

## Plugin Lifecycle

1. **Load**: Plugin is loaded from disk/npm
2. **Validate**: Plugin manifest is validated
3. **Initialize**: initialize() is called with context
4. **Execute**: execute() is called for each request
5. **Shutdown**: shutdown() is called when plugin is disabled

## Debugging Plugins

### Enable Debug Logging

```env
LOG_LEVEL=debug
```

### View Plugin Logs

```bash
docker-compose logs -f backend | grep plugin
```

### Use Debugger

```json
{
  "type": "node",
  "request": "attach",
  "name": "Debug Plugin",
  "port": 9229
}
```

## Plugin Marketplace

Coming soon: Browse, install, and share plugins with the community.

Features:
- Plugin search and discovery
- Ratings and reviews
- Automatic updates
- Security scanning
- Usage analytics

## Support

- Documentation: https://github.com/NickScherbakov/ai-unifier/docs
- Issues: https://github.com/NickScherbakov/ai-unifier/issues
- Discussions: https://github.com/NickScherbakov/ai-unifier/discussions

## Example Plugins

Check out these example plugins:
- `@ai-unifier/plugin-slack` - Slack integration
- `@ai-unifier/plugin-discord` - Discord integration
- `@ai-unifier/plugin-analytics` - Advanced analytics
- `@ai-unifier/plugin-cache` - Response caching
