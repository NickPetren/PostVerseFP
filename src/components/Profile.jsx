import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Heart, MessageCircle, MoreVertical, ChevronDown } from 'lucide-react';
import EditProfileModal from './Profile/EditProfileModal';
import PostCard from './PostCard';


const Profile = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [selectedPost, setSelectedPost] = useState(null);
    const [showEditPostModal, setShowEditPostModal] = useState(false);
    const [showDeletePostModal, setShowDeletePostModal] = useState(false);
    
    const navigate = useNavigate();
    const { userId } = useParams();
    const currentUser = JSON.parse(localStorage.getItem('user'));
    console.log('Current user:', currentUser);
    console.log('URL userId:', userId);
    const profileId = userId || currentUser.id;
    console.log('Selected profileId:', profileId);
    const isOwnProfile = profileId === currentUser.id;

    useEffect(() => {
        console.log('Profile effect triggered with:', {
            userId,
            currentUser,
            isOwnProfile,
            profileId
        });
     
        const fetchProfileData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5177/auth/user/${profileId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
     
                if (!response.ok) {
                    throw new Error('Failed to fetch user profile');
                }
     
                const data = await response.json();
                setProfileData(data.user);
                setIsFollowing(data.user.isFollowing);
                setFollowersCount(data.user.followersCount || 0);
                setFollowingCount(data.user.followingCount || 0);
            } catch (error) {
                console.error('Error fetching profile:', error);
                setError('Failed to load profile');
            }
        };
     
        const fetchUserPosts = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log('Fetching posts with token:', token);
                console.log('For profile ID:', profileId);
                    
                const response = await fetch(`http://localhost:5177/posts/user/${profileId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
        
                const responseData = await response.json();
                console.log('Posts response:', responseData);
        
                if (!response.ok) {
                    throw new Error(responseData.message || 'Failed to fetch posts');
                }
        
                setPosts(responseData.posts || []);
            } catch (error) {
                console.error('Error fetching posts:', error);
                setError('Failed to load posts');
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };
     
        fetchProfileData();
        fetchUserPosts();
    }, [profileId, currentUser.id]);

    const handleToggleFollow = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5177/auth/user/${userId}/follow`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            setIsFollowing(data.isFollowing);
            setFollowersCount(data.followersCount);
        } catch (error) {
            console.error('Error toggling follow:', error);
        }
    };

    const handleLike = async (postId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5177/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to toggle like');
            }

            
            const postsResponse = await fetch(`http://localhost:5177/posts/user/${profileId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (postsResponse.ok) {
                const newPosts = await postsResponse.json();
                setPosts(Array.isArray(newPosts) ? newPosts : []);
            }
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleUpdatePost = async (updatedPostData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5177/posts/${selectedPost._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedPostData)
            });

            if (!response.ok) {
                throw new Error('Failed to update post');
            }

            const updatedPost = await response.json();
            setPosts(prevPosts => 
                prevPosts.map(post => 
                    post._id === updatedPost._id ? updatedPost : post
                )
            );
            setShowEditPostModal(false);
            setSelectedPost(null);
        } catch (error) {
            console.error('Error updating post:', error);
            alert('Failed to update post: ' + error.message);
        }
    };

    const handleDeletePost = async () => {
        if (!selectedPost) return;
        
        try {
            console.log('Attempting to delete post:', selectedPost._id);
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5177/posts/${selectedPost._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Delete response status:', response.status);

            if (!response.ok && response.status !== 404) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete post');
            }

            
            setPosts(prevPosts => prevPosts.filter(post => post._id !== selectedPost._id));
            setShowDeletePostModal(false);
            setSelectedPost(null);
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post: ' + error.message);
        }
    };

    const handleEditPostClick = (post) => {
        setSelectedPost(post);
        setShowEditPostModal(true);
    };

    const handleDeletePostClick = (post) => {
        setSelectedPost(post);
        setShowDeletePostModal(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth');
    };

    const handleDeleteAccount = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5177/auth/delete', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/auth');
            } else {
                throw new Error('Failed to delete account');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            setError('Failed to delete account');
        }
    };

    if (loading || !profileData) {
        return <div className="text-center mt-20">Loading...</div>;
    }

    if (error) {
        return <div className="text-center mt-20 text-red-500">{error}</div>;
    }

    return (
        <>
            <section className='profile_page'>
                <div className='profile'>
                    <div>
                        <div className="profile_info">
                            <div className="profile-avatar-container">
                                <img 
                                    src={profileData.avatar || '/default-avatar.png'} 
                                    alt={profileData.displayName}
                                    className="profile-avatar"
                                />
                            </div>
                            <div className="profile-details">
                                <h1>{profileData.displayName}</h1>
                                <p>@{profileData.username}</p>
                                <div className="profile-stats">
                                    <Link 
                                        to={`/profile/${profileId}/followers`} 
                                        className="stat-item"
                                    >
                                        <span className="stat-label">Followers</span>
                                        <span className="stat-value">{followersCount}</span>
                                    </Link>
                                    <Link 
                                        to={`/profile/${profileId}/following`} 
                                        className="stat-item"
                                    >
                                        <span className="stat-label">Following</span>
                                        <span className="stat-value">{followingCount}</span>
                                    </Link>
                                </div>
                                {!isOwnProfile && (
                                    <button 
                                        className={`follow-button ${isFollowing ? 'following' : ''}`}
                                        onClick={handleToggleFollow}
                                    >
                                        {isFollowing ? 'Following' : 'Follow'}
                                    </button>
                                )}
                            </div>
                            {isOwnProfile && (
                                <div className="profile-menu">
                                    <button 
                                        className="menu-dots"
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        aria-label="Profile menu"
                                    >
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </button>
                                    {isMenuOpen && (
                                        <div className="menu-dropdown">
                                            <button onClick={() => {
                                                setIsMenuOpen(false);
                                                setShowEditProfileModal(true);
                                            }}>
                                                Edit Profile
                                            </button>
                                            <button onClick={() => {
                                                setIsMenuOpen(false);
                                                handleLogout();
                                            }}>
                                                Log Out
                                            </button>
                                            <button 
                                                className="delete-account"
                                                onClick={() => {
                                                    setIsMenuOpen(false);
                                                    setShowDeleteAccountModal(true);
                                                }}
                                            >
                                                Delete Account
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <h2>Posts</h2>
                    <div className="posts-grid">
                        {posts.length === 0 ? (
                            <div className="text-center text-gray-500">No posts yet</div>
                        ) : (
                            posts.map((post) => (
                                <PostCard
                                    key={post._id}
                                    post={post}
                                    currentUserId={currentUser.id}
                                    onLike={handleLike}
                                    onEditClick={handleEditPostClick}
                                    onDeleteClick={handleDeletePostClick}
                                    isSinglePost={false}
                                />
                            ))
                        )}
                    </div>
                </div>
            </section>

            {showEditPostModal && selectedPost && (
                <div className="modal-overlay">
                    <EditPostModal
                        post={selectedPost}
                        onClose={() => {
                            setShowEditPostModal(false);
                            setSelectedPost(null);
                        }}
                        onUpdate={handleUpdatePost}
                    />
                </div>
            )}

            {showDeletePostModal && selectedPost && (
                <div className="delete-modal-overlay">
                    <div className="delete-modal">
                        <h2>Delete Post</h2>
                        <p>Are you sure you want to delete this post? This action cannot be undone.</p>
                        <div className="modal-buttons">
                            <button 
                                className="cancel-button"
                                onClick={() => {
                                    setShowDeletePostModal(false);
                                    setSelectedPost(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                className="delete-button"
                                onClick={handleDeletePost}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteAccountModal && (
                <div className="delete-modal-overlay">
                    <div className="delete-modal">
                        <h2>Delete Account</h2>
                        <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                        <div className="delete-modal-buttons">
                            <button 
                                className="confirm-delete"
                                onClick={handleDeleteAccount}
                            >
                                Yes, Delete
                            </button>
                            <button 
                                className="cancel-delete"
                                onClick={() => setShowDeleteAccountModal(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEditProfileModal && (
                <EditProfileModal
                    isOpen={showEditProfileModal}
                    onClose={() => setShowEditProfileModal(false)}
                    user={profileData}
                    onUpdate={setProfileData}
                />
            )}
        </>
    );
};

export default Profile;