import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { ArrowLeft } from 'lucide-react';

const TagPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { tagName } = useParams();
    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5177/posts/tag/${tagName}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch posts');
                }

                const data = await response.json();
                setPosts(data.posts);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [tagName]);

    if (loading) {
        return <div className="loading">Loading posts...</div>;
    }

    return (
        <div className="tag-page">
            <div className="tag-header">
                
                <h1>Posts tagged with #{tagName}</h1>
            </div>
            <div className="posts-grid">
                {posts.length === 0 ? (
                    <div className="no-posts">No posts found with this tag</div>
                ) : (
                    posts.map(post => (
                        <PostCard
                            key={post._id}
                            post={post}
                            currentUserId={currentUser.id}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default TagPage;