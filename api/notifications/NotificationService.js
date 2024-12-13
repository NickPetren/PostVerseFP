import NotificationModel from './NotificationModel.js';

class NotificationService {
    async createNotification(data) {
        return await NotificationModel.create(data);
    }

    async getNotifications(userId) {
        return await NotificationModel.find({ recipient: userId })
            .populate('sender', 'displayName username avatar')
            .populate('post', 'title')
            .sort({ createdAt: -1 })
            .limit(50);
    }

    async markAsRead(notificationId) {
        return await NotificationModel.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true }
        );
    }

    async markAllAsRead(userId) {
        return await NotificationModel.updateMany(
            { recipient: userId, isRead: false },
            { isRead: true }
        );
    }

    async createFollowNotification(followerId, followedId) {
        return await this.createNotification({
            recipient: followedId,
            sender: followerId,
            type: 'follow'
        });
    }

    async createLikeNotification(userId, postId, postAuthorId) {
        return await this.createNotification({
            recipient: postAuthorId,
            sender: userId,
            type: 'like',
            post: postId
        });
    }

    async createCommentNotification(userId, postId, postAuthorId) {
        return await this.createNotification({
            recipient: postAuthorId,
            sender: userId,
            type: 'comment',
            post: postId
        });
    }

    async createNewPostNotification(authorId, postId, followerIds) {
        const notifications = followerIds.map(followerId => ({
            recipient: followerId,
            sender: authorId,
            type: 'new_post',
            post: postId
        }));

        return await NotificationModel.insertMany(notifications);
    }
}

export default new NotificationService();