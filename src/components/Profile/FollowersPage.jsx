import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const FollowersPage = () => {
    const [followers, setFollowers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { userId } = useParams();
    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchFollowers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5177/auth/user/${userId}/followers`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch followers');
                }

                const data = await response.json();
                setFollowers(data.followers);
            } catch (error) {
                console.error('Error fetching followers:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFollowers();
    }, [userId]);

    if (loading) {
        return <div className="text-center mt-20">Loading...</div>;
    }

    if (error) {
        return <div className="text-center mt-20 text-red-500">{error}</div>;
    }

    return (
        <div className="followers-page">
            <h1 className="page-title">Followers</h1>
            <div className="users-list">
                {followers.length === 0 ? (
                    <div className="text-center text-gray-500">No followers yet</div>
                ) : (
                    followers.map(follower => (
                        <div key={follower._id} className="user-item">
                            <Link to={`/profile/${follower._id}`} className="user-info">
                                <div className="user-avatar-container">
                                    <img 
                                        src={follower.avatar || '/default-avatar.png'} 
                                        alt={follower.displayName}
                                        className="user-avatar"
                                    />
                                </div>
                                <div className="user-details">
                                    <span className="user-name">{follower.displayName}</span>
                                    <span className="user-username">@{follower.username}</span>
                                </div>
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FollowersPage;