import { Router, Request, Response } from 'express';
import { providerRegistry } from '@core/provider.registry';
import { ChatRequest } from '@types/index';
import { logger } from '@utils/logger';
import { AppError } from '@middleware/errorHandler';

const router = Router();

/**
 * POST /api/v1/chat/completions
 * Create a chat completion
 */
router.post('/completions', async (req: Request, res: Response) => {
  try {
    const request: ChatRequest = req.body;
    
    // Validate request
    if (!request.model || !request.messages || request.messages.length === 0) {
      throw new AppError('Invalid request: model and messages are required', 400);
    }

    // Determine provider
    const providerId = request.provider || 'openai';
    const provider = providerRegistry.get(providerId);

    if (!provider) {
      throw new AppError(`Provider ${providerId} not found or not registered`, 404);
    }

    // Handle streaming
    if (request.stream && provider.chatStream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      try {
        const stream = provider.chatStream(request);
        
        for await (const chunk of stream) {
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }
        
        res.write('data: [DONE]\n\n');
        res.end();
      } catch (error: any) {
        logger.error('Streaming error:', error);
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      }
    } else {
      // Non-streaming request
      const response = await provider.chat(request);
      res.json(response);
    }
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Chat completion error:', error);
    throw new AppError(error.message || 'Chat completion failed', 500);
  }
});

export default router;
