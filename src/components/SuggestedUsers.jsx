import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SuggestedUsers = () => {
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchSuggestedUsers();
    }, []);

    const fetchSuggestedUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5177/auth/suggested-users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch suggested users');
            }

            const data = await response.json();
            setSuggestedUsers(data);
        } catch (error) {
            console.error('Error fetching suggested users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollowClick = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5177/auth/user/${userId}/follow`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to follow user');
            }

            
            setSuggestedUsers(prev => prev.filter(user => user._id !== userId));
        } catch (error) {
            console.error('Error following user:', error);
        }
    };

    if (loading) {
        return (
            <div className="suggested-users-container">
                <h2>Suggested Users</h2>
                <div className="loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="suggested-users-container">
            <h2>Suggested Users</h2>
            <div className="suggested-users-list">
                {suggestedUsers.map(user => (
                    <div key={user._id} className="suggested-user-card">
                        <Link to={`/profile/${user._id}`} className="user-info">
                            <div className="user-avatar-container">
                                <img 
                                    src={user.avatar || '/default-avatar.png'} 
                                    alt={user.displayName}
                                    className="user-avatar"
                                />
                            </div>
                            <div className="user-details">
                                <span className="display-name">{user.displayName}</span>
                                <span className="username">@{user.username}</span>
                            </div>
                        </Link>
                        <button 
                            className="follow-button"
                            onClick={() => handleFollowClick(user._id)}
                        >
                            Follow
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SuggestedUsers;