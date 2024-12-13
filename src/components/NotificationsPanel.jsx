import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const NotificationsPanel = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5177/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch notifications');
            const data = await response.json();
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch('http://localhost:5177/notifications/mark-all-read', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setNotifications(prev => 
                prev.map(notif => ({ ...notif, isRead: true }))
            );
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    const getNotificationText = (notification) => {
        const senderName = notification.sender.displayName;
        switch (notification.type) {
            case 'follow':
                return `${senderName} followed you`;
            case 'like':
                return `${senderName} liked your post`;
            case 'comment':
                return `${senderName} commented on your post`;
            case 'new_post':
                return `${senderName} created a new post`;
            default:
                return '';
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            try {
                const token = localStorage.getItem('token');
                await fetch(`http://localhost:5177/notifications/${notification._id}/read`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                setNotifications(prev =>
                    prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
                );
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        }
    };

    return (
        <div className="notifications-panel">
            <div className="notifications-header">
                <h2>Notifications</h2>
                <button 
                    className="mark-all-read"
                    onClick={markAllAsRead}
                >
                    Mark all as read
                </button>
            </div>
            <div className="notifications-list">
                {notifications.map(notification => (
                    <Link
                        key={notification._id}
                        to={notification.type !== 'follow' ? `/post/${notification.post._id}` : `/profile/${notification.sender._id}`}
                        className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                    >
                        <div className="notification-avatar">
                            <img 
                                src={notification.sender.avatar || '/default-avatar.png'} 
                                alt={notification.sender.displayName} 
                            />
                        </div>
                        <div className="notification-content">
                            <p>{getNotificationText(notification)}</p>
                            <span className="notification-time">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                    </Link>
                ))}
                {notifications.length === 0 && (
                    <div className="no-notifications">
                        No notifications yet
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPanel;