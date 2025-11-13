import { Router, Request, Response } from 'express';

const router = Router();

router.post('/', async (_req: Request, res: Response) => {
  res.json({ message: 'Embedding endpoint - to be implemented' });
});

export default router;
