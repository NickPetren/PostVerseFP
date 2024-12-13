import { Router } from 'express';
import { authMiddleware } from '../auth/authMiddleware.js';
import NotificationController from './NotificationController.js';

const router = Router();

router.get('/', authMiddleware, NotificationController.getNotifications);
router.post('/:notificationId/read', authMiddleware, NotificationController.markAsRead);
router.post('/mark-all-read', authMiddleware, NotificationController.markAllAsRead);

export default router;