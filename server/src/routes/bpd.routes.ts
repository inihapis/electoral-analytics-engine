/**
 * @openapi
 * /bpd:
 *   get:
 *     tags:
 *       - BPD
 *     summary: Get all BPD entries
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of BPDs
 *   post:
 *     tags:
 *       - BPD
 *     summary: Create a new BPD entry
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Bpd'
 *     responses:
 *       200:
 *         description: BPD created successfully
 * /bpd/stats/summary:
 *   get:
 *     tags:
 *       - BPD
 *     summary: Get aggregated BPD statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary statistics
 * /bpd/{id}:
 *   get:
 *     tags:
 *       - BPD
 *     summary: Get BPD by ID
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
 *         description: BPD data
 *   put:
 *     tags:
 *       - BPD
 *     summary: Update BPD entry
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Bpd'
 *     responses:
 *       200:
 *         description: BPD updated successfully
 *   delete:
 *     tags:
 *       - BPD
 *     summary: Delete BPD entry
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
 *         description: BPD deleted successfully
 * /bpd/bulk-upload:
 *   post:
 *     tags:
 *       - BPD
 *     summary: Bulk upload BPD data from CSV or XLSX
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Bulk upload result
 * /bpd/export/csv:
 *   get:
 *     tags:
 *       - BPD
 *     summary: Export BPD data as CSV
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file
 * /bpd/snapshot:
 *   post:
 *     tags:
 *       - BPD
 *     summary: Save current snapshot of BPD data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Snapshot saved
 * /bpd/restore-snapshot:
 *   post:
 *     tags:
 *       - BPD
 *     summary: Restore BPD data from last snapshot
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Snapshot restored
 */
import { Router } from 'express';
import * as bpdController from '../controllers/bpd.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
const router = Router();

// Public routes (authenticated users only)
router.get('/', authenticate, bpdController.getAllBpds);
router.get('/stats/summary', authenticate, bpdController.getStatsSummary);
router.get('/:id', authenticate, bpdController.getBpdById);

// Admin/Superadmin routes
router.post('/', authenticate, authorize(['ADMIN', 'SUPERADMIN']), bpdController.createBpd);
router.put('/:id', authenticate, authorize(['ADMIN', 'SUPERADMIN']), bpdController.updateBpd);
router.delete('/:id', authenticate, authorize(['SUPERADMIN']), bpdController.deleteBpd);
router.post('/bulk-upload', authenticate, authorize(['ADMIN', 'SUPERADMIN']), upload.single('file'), bpdController.bulkUpload);
router.get('/export/csv', authenticate, authorize(['ADMIN', 'SUPERADMIN']), bpdController.exportToCsv);
router.post('/snapshot', authenticate, authorize(['SUPERADMIN']), bpdController.saveSnapshot);
router.post('/restore-snapshot', authenticate, authorize(['SUPERADMIN']), bpdController.restoreSnapshot);

export default router;
