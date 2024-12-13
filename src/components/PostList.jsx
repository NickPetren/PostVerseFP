import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import EditPostModal from './EditPostModal';
import PostCard from './PostCard';
import LoadingLogo from './LoadingLogo';

const PostList = () => {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    const observer = useRef();
    const lastPostElementRef = useCallback(node => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, hasMore]);

    const currentUser = JSON.parse(localStorage.getItem('user'));

    const fetchPosts = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('Fetching posts with token:', token);
            
            const response = await fetch('http://localhost:5177/posts', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            const data = await response.json();
            console.log('Posts response:', data);
    
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch posts');
            }
    
            setPosts(data.posts || []);
            setError(null);
        } catch (error) {
            console.error('Error fetching posts:', error);
            setError('Failed to load posts');
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setIsLoading(true);
        fetchPosts(page);
    }, [page]);

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

            const updatedPost = await response.json();
            setPosts(prevPosts => 
                prevPosts.map(post => 
                    post._id === postId ? updatedPost : post
                )
            );
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
            setShowEditModal(false);
            setSelectedPost(null);
        } catch (error) {
            console.error('Error updating post:', error);
            alert('Failed to update post: ' + error.message);
        }
    };

    const handleDeletePost = async () => {
        if (!selectedPost) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5177/posts/${selectedPost._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok && response.status !== 404) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete post');
            }

            setPosts(prevPosts => prevPosts.filter(post => post._id !== selectedPost._id));
            setShowDeleteModal(false);
            setSelectedPost(null);
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post: ' + error.message);
        }
    };

    const handleEditClick = (post) => {
        setSelectedPost(post);
        setShowEditModal(true);
    };

    const handleDeleteClick = (post) => {
        setSelectedPost(post);
        setShowDeleteModal(true);
    };

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="error text-xl text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <>
            <div className="main_container">
                <div className="posts-grid">
                    {loading && posts.length === 0 ? (
                        <LoadingLogo />
                    ) : posts.length === 0 ? (
                        <div className="text-center text-gray-500">No posts yet</div>
                    ) : (
                        posts.map((post, index) => {
                            if (posts.length === index + 1) {
                                return (
                                    <div ref={lastPostElementRef} key={post._id}>
                                        <PostCard
                                            post={post}
                                            currentUserId={currentUser.id}
                                            onLike={handleLike}
                                            onEditClick={handleEditClick}
                                            onDeleteClick={handleDeleteClick}
                                            isSinglePost={false}
                                        />
                                    </div>
                                );
                            } else {
                                return (
                                    <PostCard
                                        key={post._id}
                                        post={post}
                                        currentUserId={currentUser.id}
                                        onLike={handleLike}
                                        onEditClick={handleEditClick}
                                        onDeleteClick={handleDeleteClick}
                                        isSinglePost={false}
                                    />
                                );
                            }
                        })
                    )}
                    {loading && posts.length > 0 && <LoadingLogo />}
                </div>
            </div>
     
            {showEditModal && selectedPost && (
                <div className="modal-overlay">
                    <EditPostModal
                        post={selectedPost}
                        onClose={() => {
                            setShowEditModal(false);
                            setSelectedPost(null);
                        }}
                        onUpdate={handleUpdatePost}
                    />
                </div>
            )}
     
            {showDeleteModal && selectedPost && (
                <div className="delete-modal-overlay">
                    <div className="delete-modal">
                        <h2>Delete Post</h2>
                        <p>Are you sure you want to delete this post? This action cannot be undone.</p>
                        <div className="modal-buttons">
                            <button 
                                className="cancel-button"
                                onClick={() => {
                                    setShowDeleteModal(false);
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
        </>
     );
};

export default PostList;