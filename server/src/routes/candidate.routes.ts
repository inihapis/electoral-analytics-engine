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
 * /candidates/{id}:
 *   get:
 *     tags:
 *       - Candidate
 *     summary: Get candidate by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Candidate detail
 * /candidates/indicators/{bpdId}/{candidateId}:
 *   put:
 *     tags:
 *       - Candidate
 *     summary: Update candidate indicator for a BPD
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: bpdId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: candidateId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               suratBaiat:
 *                 type: boolean
 *               afiliasiPolitik:
 *                 type: boolean
 *               videoDukungan:
 *                 type: boolean
 *               kedekatanMc:
 *                 type: boolean
 *               atributFisik:
 *                 type: boolean
 *               sosialMedia:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Indicator updated
 */
import { Router } from 'express';
import * as candidateController from '../controllers/candidate.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public routes (authenticated users only)
router.get('/', authenticate, candidateController.getAllCandidates);
router.get('/:id', authenticate, candidateController.getCandidateById);

// Admin/Superadmin routes
router.put('/indicators/:bpdId/:candidateId', authenticate, authorize(['ADMIN', 'SUPERADMIN']), candidateController.updateCandidateIndicator);

export default router;
