import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Heart, Reply, X } from 'lucide-react';

const ImageGallery = ({ images, initialIndex = 0, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const handleNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="image-modal" onClick={onClose}>
            <button className="close-modal" onClick={onClose}>
                <X size={24} />
            </button>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                {images.length > 1 && (
                    <>
                        <button className="gallery-nav prev" onClick={handlePrev}>❮</button>
                        <button className="gallery-nav next" onClick={handleNext}>❯</button>
                    </>
                )}
                <img src={images[currentIndex]} alt="Full size" />
                {images.length > 1 && (
                    <div className="gallery-counter">
                        {currentIndex + 1} / {images.length}
                    </div>
                )}
            </div>
        </div>
    );
};

const Comment = ({ comment, onReply, currentUserId, level = 0 }) => {
    const [showReplyButton, setShowReplyButton] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        try {
            await onReply(comment._id, replyText.trim());
            setReplyText('');
            setIsReplying(false);
        } catch (error) {
            console.error('Error submitting reply:', error);
        }
    };

    const maxLevel = 2;

    return (
        <div className="comment-container">
            <div 
                className="comment" 
                onMouseEnter={() => setShowReplyButton(true)}
                onMouseLeave={() => setShowReplyButton(false)}
            >
                <Link to={`/profile/${comment.author._id}`} className="comment-author">
                    <div className="comment-avatar-container">
                        <img 
                            src={comment.author.avatar || '/default-avatar.png'} 
                            alt={comment.author.displayName}
                            className="comment-avatar"
                        />
                    </div>
                    <span className="comment-username">@{comment.author.username}</span>
                </Link>
                <p className="comment-text">{comment.text}</p>
                {showReplyButton && comment.author._id !== currentUserId && level < maxLevel && (
                    <button 
                        className="reply-button"
                        onClick={() => setIsReplying(true)}
                    >
                        <Reply size={16} />
                        Reply
                    </button>
                )}
            </div>

            {isReplying && (
                <form onSubmit={handleReplySubmit} className="reply-form">
                    <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="reply-input"
                        autoFocus
                    />
                    <div className="reply-buttons">
                        <button 
                            type="button" 
                            className="cancel-reply"
                            onClick={() => setIsReplying(false)}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="submit-reply"
                            disabled={!replyText.trim()}
                        >
                            Reply
                        </button>
                    </div>
                </form>
            )}

            {comment.replies && comment.replies.length > 0 && (
                <div className="replies">
                    {comment.replies.map(reply => (
                        <Comment 
                            key={reply._id} 
                            comment={reply}
                            onReply={onReply}
                            currentUserId={currentUserId}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const PostPage = () => {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [showGallery, setShowGallery] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    const commentInputRef = useRef(null);
    const { postId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (location.state?.focusComment && commentInputRef.current) {
            commentInputRef.current.focus();
        }
    }, [location.state?.focusComment]);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5177/posts/${postId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch post');
                }

                const data = await response.json();
                setPost(data);
                setIsLiked(data.likes?.includes(currentUser.id));
                setLikeCount(data.likes?.length || 0);
            } catch (error) {
                console.error('Error fetching post:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchComments = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5177/posts/${postId}/comments`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch comments');
                }

                const data = await response.json();
                setComments(data);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        fetchPost();
        fetchComments();
    }, [postId, currentUser.id]);

    const handleLike = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5177/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to like post');
            }

            const updatedPost = await response.json();
            setPost(updatedPost);
            setIsLiked(!isLiked);
            setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5177/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text: comment.trim() })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to add comment');
            }

            setComments(prev => [data, ...prev]);
            setComment('');
        } catch (error) {
            console.error('Error details:', error);
            alert(error.message || 'Error posting comment');
        }
    };

    const handleReply = async (parentCommentId, text) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5177/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    text,
                    parentCommentId 
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add reply');
            }

            const updatedComment = await response.json();
            
            setComments(prev => {
                return prev.map(comment => {
                    if (comment._id === updatedComment._id) {
                        return updatedComment;
                    }
                    return comment;
                });
            });
        } catch (error) {
            console.error('Error posting reply:', error);
            throw error;
        }
    };

    const renderImages = () => {
        if (!post.images || post.images.length === 0) return null;

        return (
            <div className="post-images full-view">
                {post.images.length === 1 ? (
                    <div className="single-image" onClick={() => {
                        setCurrentImageIndex(0);
                        setShowGallery(true);
                    }}>
                        <img src={post.images[0]} alt="Post content" />
                    </div>
                ) : post.images.length === 2 ? (
                    <div className="double-image">
                        {post.images.map((image, index) => (
                            <img 
                                key={index} 
                                src={image} 
                                alt={`Post content ${index + 1}`}
                                onClick={() => {
                                    setCurrentImageIndex(index);
                                    setShowGallery(true);
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="image-grid">
                        {post.images.slice(0, 4).map((image, index) => (
                            <div 
                                key={index} 
                                className={`grid-item ${index === 3 && post.images.length > 4 ? 'has-more' : ''}`}
                                onClick={() => {
                                    setCurrentImageIndex(index);
                                    setShowGallery(true);
                                }}
                            >
                                <img src={image} alt={`Post content ${index + 1}`} />
                                {index === 3 && post.images.length > 4 && (
                                    <div className="more-images">
                                        +{post.images.length - 4}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (error || !post) {
        return <div className="flex justify-center items-center min-h-screen text-red-500">{error || 'Post not found'}</div>;
    }

    return (
        <div className="post-page">
            <button 
                className="back-button"
                onClick={() => navigate(-1)}
                aria-label="Go back"
            >
                <ArrowLeft size={24} />
            </button>

            <div className="post-container">
                <div className="post-card single">
                    <div className="post-header">
                        <Link to={`/profile/${post.author._id}`} className="author-info">
                            <div className="author-avatar-container">
                                <img 
                                    src={post.author.avatar || '/default-avatar.png'} 
                                    alt={post.author.displayName}
                                    className="author-avatar"
                                />
                            </div>
                            <div className="author-details">
                                <span className="author-name">{post.author.displayName}</span>
                                <span className="author-username">@{post.author.username}</span>
                            </div>
                        </Link>
                        <button 
                            className={`action-button ${isLiked ? 'liked' : ''}`}
                            onClick={handleLike}
                        >
                            <Heart 
                                size={20}
                                fill={isLiked ? "#e31b23" : "none"}
                                color={isLiked ? "#e31b23" : "currentColor"}
                            />
                            {likeCount > 0 && <span>{likeCount}</span>}
                        </button>
                    </div>

                    <div className="post-content">
                        <h1 className="post-title">{post.title}</h1>
                        <p className="post-text">{post.text}</p>
                        {renderImages()}
                        
                        {/* Секция тегов */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="post-tags">
                                {post.tags.map(tag => (
                                    <Link 
                                        key={tag} 
                                        to={`/tag/${tag}`} 
                                        className="post-tag"
                                    >
                                        #{tag}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {showGallery && (
                        <ImageGallery 
                            images={post.images} 
                            initialIndex={currentImageIndex}
                            onClose={() => {
                                setShowGallery(false);
                                setCurrentImageIndex(0);
                            }}
                        />
                    )}

                    <div className="comment-section">
                        <form onSubmit={handleSubmitComment} className="comment-form">
                            <input
                                ref={commentInputRef}
                                type="text"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="comment-input"
                            />
                            <button 
                                type="submit" 
                                className="comment-submit"
                                disabled={!comment.trim()}
                            >
                                Send
                            </button>
                        </form>

                        <div className="comments-list">
                            {comments.map(comment => (
                                <Comment
                                    key={comment._id}
                                    comment={comment}
                                    onReply={handleReply}
                                    currentUserId={currentUser.id}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostPage;