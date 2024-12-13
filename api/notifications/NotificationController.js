import NotificationService from './NotificationService.js';

class NotificationController {
    async getNotifications(req, res) {
        try {
            const notifications = await NotificationService.getNotifications(req.userId);
            res.json(notifications);
        } catch (error) {
            console.error('Error getting notifications:', error);
            res.status(500).json({ message: error.message });
        }
    }

    async markAsRead(req, res) {
        try {
            await NotificationService.markAsRead(req.params.notificationId);
            res.json({ success: true });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            res.status(500).json({ message: error.message });
        }
    }

    async markAllAsRead(req, res) {
        try {
            await NotificationService.markAllAsRead(req.userId);
            res.json({ success: true });
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            res.status(500).json({ message: error.message });
        }
    }
}

export default new NotificationController();