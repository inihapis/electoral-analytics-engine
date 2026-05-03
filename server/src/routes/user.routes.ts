/**
 * @openapi
 * /users:
 *   get:
 *     tags:
 *       - User
 *     summary: Get all users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User list
 *   post:
 *     tags:
 *       - User
 *     summary: Create a new user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: ['SUPERADMIN', 'ADMIN', 'USER']
 *     responses:
 *       200:
 *         description: User created successfully
 * /users/{id}:
 *   put:
 *     tags:
 *       - User
 *     summary: Update a user
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
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: ['SUPERADMIN', 'ADMIN', 'USER']
 *     responses:
 *       200:
 *         description: User updated successfully
 *   delete:
 *     tags:
 *       - User
 *     summary: Delete a user
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
 *         description: User deleted successfully
 */
import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Superadmin only routes
router.get('/', authenticate, authorize(['SUPERADMIN']), userController.getAllUsers);
router.post('/', authenticate, authorize(['SUPERADMIN']), userController.createUser);
router.put('/:id', authenticate, authorize(['SUPERADMIN']), userController.updateUser);
router.delete('/:id', authenticate, authorize(['SUPERADMIN']), userController.deleteUser);

export default router;
