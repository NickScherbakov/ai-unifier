import { providerRegistry } from '@core/provider.registry';
import { OpenAIProvider } from './openai.provider';
import { AnthropicProvider } from './anthropic.provider';
import { config } from '@config/index';
import { logger } from '@utils/logger';

/**
 * Initialize and register all providers based on configuration
 */
export const initializeProviders = async () => {
  logger.info('Initializing AI providers...');

  // Initialize OpenAI if API key is provided
  if (config.providers.openai.apiKey) {
    try {
      const openaiProvider = new OpenAIProvider();
      await openaiProvider.initialize({
        id: 'openai',
        providerId: 'openai',
        name: 'OpenAI',
        credentials: {
          apiKey: config.providers.openai.apiKey,
          baseUrl: config.providers.openai.baseUrl,
        },
        isEnabled: true,
        priority: 1,
      });
      providerRegistry.register(openaiProvider);
      logger.info('OpenAI provider registered successfully');
    } catch (error) {
      logger.error('Failed to initialize OpenAI provider:', error);
    }
  } else {
    logger.warn('OpenAI API key not provided, skipping initialization');
  }

  // Initialize Anthropic if API key is provided
  if (config.providers.anthropic.apiKey) {
    try {
      const anthropicProvider = new AnthropicProvider();
      await anthropicProvider.initialize({
        id: 'anthropic',
        providerId: 'anthropic',
        name: 'Anthropic',
        credentials: {
          apiKey: config.providers.anthropic.apiKey,
        },
        isEnabled: true,
        priority: 2,
      });
      providerRegistry.register(anthropicProvider);
      logger.info('Anthropic provider registered successfully');
    } catch (error) {
      logger.error('Failed to initialize Anthropic provider:', error);
    }
  } else {
    logger.warn('Anthropic API key not provided, skipping initialization');
  }

  // Log registered providers
  const registeredProviders = providerRegistry.getAll();
  logger.info(`Total providers registered: ${registeredProviders.length}`);
  registeredProviders.forEach(provider => {
    logger.info(`- ${provider.name} (${provider.id})`);
  });
};
