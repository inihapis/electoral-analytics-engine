import { Router } from 'express';
import authRoutes from './auth.routes';
import bpdRoutes from './bpd.routes';
import userRoutes from './user.routes';
import candidateRoutes from './candidate.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/bpd', bpdRoutes);
router.use('/users', userRoutes);
router.use('/candidates', candidateRoutes);

export default router;
