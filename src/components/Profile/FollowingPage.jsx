import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const FollowingPage = () => {
    const [following, setFollowing] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { userId } = useParams();
    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchFollowing = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5177/auth/user/${userId}/following`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch following');
                }

                const data = await response.json();
                setFollowing(data.following);
            } catch (error) {
                console.error('Error fetching following:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFollowing();
    }, [userId]);

    const handleUnfollow = async (followedUserId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5177/auth/user/${followedUserId}/follow`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to unfollow user');
            }

            // Обновляем список после отписки
            setFollowing(following.filter(user => user._id !== followedUserId));
        } catch (error) {
            console.error('Error unfollowing user:', error);
        }
    };

    if (loading) {
        return <div className="text-center mt-20">Loading...</div>;
    }

    if (error) {
        return <div className="text-center mt-20 text-red-500">{error}</div>;
    }

    return (
        <div className="following-page">
            <h1 className="page-title">Following</h1>
            <div className="users-list">
                {following.length === 0 ? (
                    <div className="text-center text-gray-500">Not following anyone yet</div>
                ) : (
                    following.map(followedUser => (
                        <div key={followedUser._id} className="user-item">
                            <Link to={`/profile/${followedUser._id}`} className="user-info">
                                <div className="user-avatar-container">
                                    <img 
                                        src={followedUser.avatar || '/default-avatar.png'} 
                                        alt={followedUser.displayName}
                                        className="user-avatar"
                                    />
                                </div>
                                <div className="user-details">
                                    <span className="user-name">{followedUser.displayName}</span>
                                    <span className="user-username">@{followedUser.username}</span>
                                </div>
                            </Link>
                            {userId === currentUser.id && (
                                <button 
                                    className="unfollow-button"
                                    onClick={() => handleUnfollow(followedUser._id)}
                                >
                                    Unfollow
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FollowingPage;