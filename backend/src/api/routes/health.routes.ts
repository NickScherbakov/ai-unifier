import { Router, Request, Response } from 'express';
import { providerRegistry } from '@core/provider.registry';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const providers = providerRegistry.getAll();

  const healthChecks = await Promise.all(
    providers.map(async p => ({
      provider: p.id,
      status: await p.healthCheck(),
    }))
  );

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    providers: healthChecks,
  });
});

export default router;
