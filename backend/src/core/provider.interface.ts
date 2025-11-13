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
} from '../types';

/**
 * Base interface that all AI providers must implement
 */
export interface AIProvider {
  // Provider identification
  readonly id: string;
  readonly name: string;
  readonly type: ProviderType;

  /**
   * Initialize the provider with configuration
   */
  initialize(config: ProviderConfig): Promise<void>;

  /**
   * Chat completion request
   */
  chat(request: ChatRequest): Promise<ChatResponse>;

  /**
   * Streaming chat completion
   */
  chatStream?(request: ChatRequest): AsyncGenerator<ChatStreamChunk>;

  /**
   * Text completion request
   */
  completion?(request: CompletionRequest): Promise<CompletionResponse>;

  /**
   * Generate embeddings
   */
  embed?(request: EmbeddingRequest): Promise<EmbeddingResponse>;

  /**
   * Health check
   */
  healthCheck(): Promise<HealthStatus>;

  /**
   * Get provider capabilities
   */
  getCapabilities(): ProviderCapabilities;

  /**
   * Get rate limit information
   */
  getRateLimits?(): Promise<any>;

  /**
   * Estimate cost for a request
   */
  getCost?(request: any): CostEstimate;

  /**
   * Cleanup resources
   */
  shutdown?(): Promise<void>;
}

/**
 * Base abstract class with common provider functionality
 */
export abstract class BaseProvider implements AIProvider {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly type: ProviderType;

  protected config?: ProviderConfig;
  protected isInitialized: boolean = false;

  async initialize(config: ProviderConfig): Promise<void> {
    this.config = config;
    this.isInitialized = true;
  }

  protected ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error(`Provider ${this.name} is not initialized`);
    }
  }

  abstract chat(request: ChatRequest): Promise<ChatResponse>;

  abstract healthCheck(): Promise<HealthStatus>;

  abstract getCapabilities(): ProviderCapabilities;

  async shutdown(): Promise<void> {
    this.isInitialized = false;
  }
}
