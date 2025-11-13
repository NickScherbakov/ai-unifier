import { Router, Request, Response } from 'express';
import { providerRegistry } from '@core/provider.registry';

const router = Router();

/**
 * GET /api/v1/providers
 * List all registered providers
 */
router.get('/', async (_req: Request, res: Response) => {
  const providers = providerRegistry.getAll();

  res.json({
    providers: providers.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
      capabilities: p.getCapabilities(),
    })),
  });
});

/**
 * GET /api/v1/providers/:id
 * Get provider details
 */
router.get('/:id', async (req: Request, res: Response) => {
  const provider = providerRegistry.get(req.params.id);

  if (!provider) {
    return res.status(404).json({ error: 'Provider not found' });
  }

  return res.json({
    id: provider.id,
    name: provider.name,
    type: provider.type,
    capabilities: provider.getCapabilities(),
  });
});

/**
 * GET /api/v1/providers/:id/health
 * Check provider health
 */
router.get('/:id/health', async (req: Request, res: Response) => {
  const provider = providerRegistry.get(req.params.id);

  if (!provider) {
    return res.status(404).json({ error: 'Provider not found' });
  }

  const health = await provider.healthCheck();
  return res.json(health);
});

export default router;
