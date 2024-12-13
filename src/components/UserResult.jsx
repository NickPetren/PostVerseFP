import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const UserResult = ({ user }) => {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const handleToggleFollow = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5177/auth/user/${user._id}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle follow');
      }

      const data = await response.json();
      setIsFollowing(data.isFollowing);
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  return (
    <div className="user-result-card">
      <Link to={`/profile/${user._id}`} className="user-result-link">
        <div className="user-result-avatar">
          <img src={user.avatar || '/default-avatar.png'} alt={user.displayName} />
        </div>
        <div className="user-result-info">
          <h4>{user.displayName}</h4>
          <span>@{user.username}</span>
        </div>
      </Link>
      {currentUser.id !== user._id && (
        <button
          className={`follow-button ${isFollowing ? 'following' : ''}`}
          onClick={handleToggleFollow}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      )}
    </div>
  );
};