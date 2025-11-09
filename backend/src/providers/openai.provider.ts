import OpenAI from 'openai';
import { BaseProvider } from '@core/provider.interface';
import {
  ChatRequest,
  ChatResponse,
  ChatStreamChunk,
  CompletionRequest,
  CompletionResponse,
  EmbeddingRequest,
  EmbeddingResponse,
  ProviderConfig,
  HealthStatus,
  ProviderCapabilities,
  CostEstimate,
  ProviderType
} from '@types/index';
import { logger } from '@utils/logger';

export class OpenAIProvider extends BaseProvider {
  readonly id = 'openai';
  readonly name = 'OpenAI';
  readonly type: ProviderType = 'multimodal';

  private client?: OpenAI;

  async initialize(config: ProviderConfig): Promise<void> {
    await super.initialize(config);
    
    if (!config.credentials.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.client = new OpenAI({
      apiKey: config.credentials.apiKey,
      baseURL: config.credentials.baseUrl
    });

    logger.info('OpenAI provider initialized');
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    this.ensureInitialized();
    
    try {
      const response = await this.client!.chat.completions.create({
        model: request.model,
        messages: request.messages as any,
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        top_p: request.topP,
        frequency_penalty: request.frequencyPenalty,
        presence_penalty: request.presencePenalty,
        stop: request.stop,
        user: request.user
      });

      return {
        id: response.id,
        object: 'chat.completion',
        created: response.created,
        model: response.model,
        provider: this.id,
        choices: response.choices.map(choice => ({
          index: choice.index,
          message: {
            role: choice.message.role,
            content: choice.message.content || ''
          },
          finishReason: choice.finish_reason || 'stop'
        })),
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0
        }
      };
    } catch (error: any) {
      logger.error('OpenAI chat error:', error);
      throw new Error(`OpenAI chat failed: ${error.message}`);
    }
  }

  async *chatStream(request: ChatRequest): AsyncIterator<ChatStreamChunk> {
    this.ensureInitialized();

    try {
      const stream = await this.client!.chat.completions.create({
        model: request.model,
        messages: request.messages as any,
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        stream: true
      });

      for await (const chunk of stream) {
        yield {
          id: chunk.id,
          object: 'chat.completion.chunk',
          created: chunk.created,
          model: chunk.model,
          provider: this.id,
          choices: chunk.choices.map(choice => ({
            index: choice.index,
            delta: {
              role: choice.delta.role,
              content: choice.delta.content
            },
            finishReason: choice.finish_reason || undefined
          }))
        };
      }
    } catch (error: any) {
      logger.error('OpenAI stream error:', error);
      throw new Error(`OpenAI stream failed: ${error.message}`);
    }
  }

  async completion(request: CompletionRequest): Promise<CompletionResponse> {
    this.ensureInitialized();

    try {
      const response = await this.client!.completions.create({
        model: request.model,
        prompt: request.prompt,
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        top_p: request.topP,
        frequency_penalty: request.frequencyPenalty,
        presence_penalty: request.presencePenalty,
        stop: request.stop,
        user: request.user
      });

      return {
        id: response.id,
        object: 'text.completion',
        created: response.created,
        model: response.model,
        provider: this.id,
        choices: response.choices.map(choice => ({
          text: choice.text,
          index: choice.index,
          finishReason: choice.finish_reason || 'stop'
        })),
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0
        }
      };
    } catch (error: any) {
      logger.error('OpenAI completion error:', error);
      throw new Error(`OpenAI completion failed: ${error.message}`);
    }
  }

  async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    this.ensureInitialized();

    try {
      const response = await this.client!.embeddings.create({
        model: request.model,
        input: request.input,
        user: request.user
      });

      return {
        object: 'list',
        model: response.model,
        provider: this.id,
        data: response.data.map(item => ({
          object: 'embedding',
          embedding: item.embedding,
          index: item.index
        })),
        usage: {
          promptTokens: response.usage.prompt_tokens,
          totalTokens: response.usage.total_tokens
        }
      };
    } catch (error: any) {
      logger.error('OpenAI embedding error:', error);
      throw new Error(`OpenAI embedding failed: ${error.message}`);
    }
  }

  async healthCheck(): Promise<HealthStatus> {
    try {
      const startTime = Date.now();
      await this.client!.models.list();
      const latency = Date.now() - startTime;

      return {
        status: 'healthy',
        latency,
        lastChecked: new Date(),
        message: 'OpenAI API is operational'
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
      supportsImages: true,
      supportsAudio: true,
      supportsVideo: false,
      supportsFunctions: true,
      maxTokens: 128000, // GPT-4 Turbo
      models: [
        'gpt-4-turbo-preview',
        'gpt-4',
        'gpt-4-32k',
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-16k',
        'text-embedding-ada-002',
        'text-embedding-3-small',
        'text-embedding-3-large'
      ]
    };
  }

  getCost(request: ChatRequest): CostEstimate {
    // Simplified cost calculation (real costs vary by model)
    const costs: Record<string, { prompt: number; completion: number }> = {
      'gpt-4': { prompt: 0.03, completion: 0.06 },
      'gpt-4-turbo-preview': { prompt: 0.01, completion: 0.03 },
      'gpt-3.5-turbo': { prompt: 0.0005, completion: 0.0015 }
    };

    const modelCost = costs[request.model] || costs['gpt-3.5-turbo'];
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
