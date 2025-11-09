// Core provider types
export type ProviderType = 'llm' | 'image' | 'audio' | 'video' | 'multimodal';

export type ProviderStatus = 'active' | 'inactive' | 'error' | 'maintenance';

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
}

export interface ChatRequest {
  provider?: string;
  model: string;
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string | string[];
  stream?: boolean;
  user?: string;
  metadata?: Record<string, any>;
}

export interface ChatResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  provider: string;
  choices: Array<{
    index: number;
    message: Message;
    finishReason: string;
  }>;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, any>;
}

export interface ChatStreamChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  provider: string;
  choices: Array<{
    index: number;
    delta: Partial<Message>;
    finishReason?: string;
  }>;
}

export interface CompletionRequest {
  provider?: string;
  model: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string | string[];
  stream?: boolean;
  user?: string;
  metadata?: Record<string, any>;
}

export interface CompletionResponse {
  id: string;
  object: 'text.completion';
  created: number;
  model: string;
  provider: string;
  choices: Array<{
    text: string;
    index: number;
    finishReason: string;
  }>;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface EmbeddingRequest {
  provider?: string;
  model: string;
  input: string | string[];
  user?: string;
}

export interface EmbeddingResponse {
  object: 'list';
  model: string;
  provider: string;
  data: Array<{
    object: 'embedding';
    embedding: number[];
    index: number;
  }>;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}

export interface ImageGenerationRequest {
  provider?: string;
  model: string;
  prompt: string;
  n?: number;
  size?: string;
  responseFormat?: 'url' | 'b64_json';
  user?: string;
}

export interface ImageGenerationResponse {
  created: number;
  provider: string;
  data: Array<{
    url?: string;
    b64Json?: string;
  }>;
}

export interface ProviderConfig {
  id: string;
  providerId: string;
  name: string;
  organizationId?: string;
  credentials: Record<string, any>;
  isEnabled: boolean;
  priority: number;
  rateLimits?: RateLimitConfig;
  costMultiplier?: number;
  customConfig?: Record<string, any>;
}

export interface RateLimitConfig {
  requestsPerMinute?: number;
  requestsPerHour?: number;
  requestsPerDay?: number;
  tokensPerMinute?: number;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  lastChecked: Date;
  message?: string;
}

export interface ProviderCapabilities {
  supportsStreaming: boolean;
  supportsImages: boolean;
  supportsAudio: boolean;
  supportsVideo: boolean;
  supportsFunctions: boolean;
  maxTokens: number;
  models: string[];
}

export interface CostEstimate {
  estimatedCost: number;
  currency: string;
  breakdown: {
    promptCost: number;
    completionCost: number;
  };
}

// API Key and Authentication types
export interface ApiKey {
  id: string;
  key: string;
  name: string;
  userId: string;
  organizationId?: string;
  scopes: string[];
  rateLimits?: RateLimitConfig;
  expiresAt?: Date;
  lastUsedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  organizationId?: string;
  role: 'admin' | 'developer' | 'viewer';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Request Log types
export interface RequestLog {
  id: string;
  timestamp: Date;
  userId?: string;
  apiKeyId: string;
  organizationId?: string;
  provider: string;
  model: string;
  endpoint: string;
  method: string;
  requestTokens: number;
  responseTokens: number;
  totalTokens: number;
  latencyMs: number;
  cost: number;
  status: 'success' | 'error';
  statusCode: number;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

// Plugin types
export interface Plugin {
  id: string;
  name: string;
  version: string;
  type: 'provider' | 'preprocessor' | 'postprocessor' | 'integration';
  description: string;
  author: string;
  isEnabled: boolean;
  config?: Record<string, any>;
}

export interface PluginContext {
  config: Record<string, any>;
  logger: any;
  cache: any;
}
