import Anthropic from '@anthropic-ai/sdk';
import { BaseProvider } from '@core/provider.interface';
import {
  ChatRequest,
  ChatResponse,
  ChatStreamChunk,
  ProviderConfig,
  HealthStatus,
  ProviderCapabilities,
  CostEstimate,
  ProviderType,
  Message
} from '../types';
import { logger } from '@utils/logger';

export class AnthropicProvider extends BaseProvider {
  readonly id = 'anthropic';
  readonly name = 'Anthropic';
  readonly type: ProviderType = 'llm';

  private client?: Anthropic;

  async initialize(config: ProviderConfig): Promise<void> {
    await super.initialize(config);
    
    if (!config.credentials.apiKey) {
      throw new Error('Anthropic API key is required');
    }

    this.client = new Anthropic({
      apiKey: config.credentials.apiKey
    });

    logger.info('Anthropic provider initialized');
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    this.ensureInitialized();
    
    try {
      // Convert messages to Anthropic format
      const { system, messages } = this.convertMessages(request.messages);
      
      const response = await this.client!.messages.create({
        model: request.model,
        system,
        messages: messages as any,
        temperature: request.temperature,
        max_tokens: request.maxTokens || 1024,
        top_p: request.topP,
        stop_sequences: Array.isArray(request.stop) ? request.stop : request.stop ? [request.stop] : undefined
      });

      return {
        id: response.id,
        object: 'chat.completion',
        created: Date.now(),
        model: response.model,
        provider: this.id,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: response.content[0].type === 'text' ? response.content[0].text : ''
          },
          finishReason: response.stop_reason || 'stop'
        }],
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens
        }
      };
    } catch (error: any) {
      logger.error('Anthropic chat error:', error);
      throw new Error(`Anthropic chat failed: ${error.message}`);
    }
  }

  async *chatStream(request: ChatRequest): AsyncGenerator<ChatStreamChunk> {
    this.ensureInitialized();

    try {
      const { system, messages } = this.convertMessages(request.messages);
      
      const stream = await this.client!.messages.create({
        model: request.model,
        system,
        messages: messages as any,
        temperature: request.temperature,
        max_tokens: request.maxTokens || 1024,
        stream: true
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          yield {
            id: 'chatcmpl-' + Date.now(),
            object: 'chat.completion.chunk',
            created: Date.now(),
            model: request.model,
            provider: this.id,
            choices: [{
              index: 0,
              delta: {
                content: event.delta.text
              }
            }]
          };
        }
        
        if (event.type === 'message_stop') {
          yield {
            id: 'chatcmpl-' + Date.now(),
            object: 'chat.completion.chunk',
            created: Date.now(),
            model: request.model,
            provider: this.id,
            choices: [{
              index: 0,
              delta: {},
              finishReason: 'stop'
            }]
          };
        }
      }
    } catch (error: any) {
      logger.error('Anthropic stream error:', error);
      throw new Error(`Anthropic stream failed: ${error.message}`);
    }
  }

  private convertMessages(messages: Message[]): { system?: string; messages: any[] } {
    const systemMessages = messages.filter(m => m.role === 'system');
    const otherMessages = messages.filter(m => m.role !== 'system');
    
    return {
      system: systemMessages.length > 0 ? systemMessages.map(m => m.content).join('\n') : undefined,
      messages: otherMessages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }))
    };
  }

  async healthCheck(): Promise<HealthStatus> {
    try {
      const startTime = Date.now();
      
      // Simple health check - try to create a minimal message
      await this.client!.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'Hi' }]
      });
      
      const latency = Date.now() - startTime;

      return {
        status: 'healthy',
        latency,
        lastChecked: new Date(),
        message: 'Anthropic API is operational'
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        lastChecked: new Date(),
        message: error.message
      };
    }
  }

  getCapabilities(): ProviderCapabilities {
    return {
      supportsStreaming: true,
      supportsImages: true, // Claude 3 supports vision
      supportsAudio: false,
      supportsVideo: false,
      supportsFunctions: false,
      maxTokens: 200000, // Claude 3 context window
      models: [
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307',
        'claude-2.1',
        'claude-2.0',
        'claude-instant-1.2'
      ]
    };
  }

  getCost(request: ChatRequest): CostEstimate {
    const costs: Record<string, { prompt: number; completion: number }> = {
      'claude-3-opus-20240229': { prompt: 0.015, completion: 0.075 },
      'claude-3-sonnet-20240229': { prompt: 0.003, completion: 0.015 },
      'claude-3-haiku-20240307': { prompt: 0.00025, completion: 0.00125 },
      'claude-2.1': { prompt: 0.008, completion: 0.024 },
      'claude-2.0': { prompt: 0.008, completion: 0.024 },
      'claude-instant-1.2': { prompt: 0.00163, completion: 0.00551 }
    };

    const modelCost = costs[request.model] || costs['claude-3-haiku-20240307'];
    const estimatedPromptTokens = request.messages.reduce((acc, msg) => acc + msg.content.length / 4, 0);
    const estimatedCompletionTokens = request.maxTokens || 1000;

    return {
      estimatedCost: (estimatedPromptTokens * modelCost.prompt + estimatedCompletionTokens * modelCost.completion) / 1000,
      currency: 'USD',
      breakdown: {
        promptCost: (estimatedPromptTokens * modelCost.prompt) / 1000,
        completionCost: (estimatedCompletionTokens * modelCost.completion) / 1000
      }
    };
  }
}
