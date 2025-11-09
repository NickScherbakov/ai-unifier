import { Router } from 'express';
import chatRoutes from './chat.routes';
import completionRoutes from './completion.routes';
import embeddingRoutes from './embedding.routes';
import providerRoutes from './provider.routes';
import healthRoutes from './health.routes';

const router = Router();

// API routes
router.use('/chat', chatRoutes);
router.use('/completions', completionRoutes);
router.use('/embeddings', embeddingRoutes);
router.use('/providers', providerRoutes);
router.use('/health', healthRoutes);

export default router;
