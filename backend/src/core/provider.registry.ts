import { AIProvider } from './provider.interface';
import { logger } from '@utils/logger';

/**
 * Provider Registry manages all available AI providers
 */
export class ProviderRegistry {
  private providers: Map<string, AIProvider> = new Map();
  private static instance: ProviderRegistry;

  private constructor() {}

  static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  /**
   * Register a provider
   */
  register(provider: AIProvider): void {
    if (this.providers.has(provider.id)) {
      logger.warn(`Provider ${provider.id} is already registered, overwriting`);
    }

    this.providers.set(provider.id, provider);
    logger.info(`Provider registered: ${provider.name} (${provider.id})`);
  }

  /**
   * Get a provider by ID
   */
  get(providerId: string): AIProvider | undefined {
    return this.providers.get(providerId);
  }

  /**
   * Get all registered providers
   */
  getAll(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Check if a provider is registered
   */
  has(providerId: string): boolean {
    return this.providers.has(providerId);
  }

  /**
   * Unregister a provider
   */
  async unregister(providerId: string): Promise<void> {
    const provider = this.providers.get(providerId);
    if (provider && provider.shutdown) {
      await provider.shutdown();
    }
    this.providers.delete(providerId);
    logger.info(`Provider unregistered: ${providerId}`);
  }

  /**
   * Get provider by type
   */
  getByType(type: string): AIProvider[] {
    return this.getAll().filter(p => p.type === type);
  }

  /**
   * Shutdown all providers
   */
  async shutdownAll(): Promise<void> {
    logger.info('Shutting down all providers...');
    const shutdownPromises = Array.from(this.providers.values())
      .filter(p => p.shutdown)
      .map(p => p.shutdown!());

    await Promise.all(shutdownPromises);
    this.providers.clear();
  }
}

export const providerRegistry = ProviderRegistry.getInstance();
