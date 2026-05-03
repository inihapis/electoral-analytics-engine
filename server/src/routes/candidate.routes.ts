/**
 * @openapi
 * /candidates:
 *   get:
 *     tags:
 *       - Candidate
 *     summary: Get all candidates with stats
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Candidate list
 */
import { Router } from 'express';
import * as candidateController from '../controllers/candidate.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public routes (authenticated users only)
router.get('/', authenticate, candidateController.getAllCandidates);
router.get('/:id', authenticate, candidateController.getCandidateById);

export default router;
