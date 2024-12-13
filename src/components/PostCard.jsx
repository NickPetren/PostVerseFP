import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, MoreVertical, ChevronDown } from 'lucide-react';
import PostImages from './PostImages';

const PostCard = ({ 
   post, 
   currentUserId,
   onLike,
   onEditClick,
   onDeleteClick,
   isSinglePost = false
}) => {
   const [isLiked, setIsLiked] = useState(post.likes?.includes(currentUserId));
   const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
   const [isFollowing, setIsFollowing] = useState(false);
   const [isMenuOpen, setIsMenuOpen] = useState(false);
   const contentRef = useRef(null);
   const [shouldShowMore, setShouldShowMore] = useState(false);
   const [isContentExpanded, setIsContentExpanded] = useState(false);

   console.log('Post data in PostCard:', post);

   useEffect(() => {
       if (!isSinglePost && contentRef.current) {
           const hasOverflow = contentRef.current.scrollHeight > 450;
           setShouldShowMore(hasOverflow);
       }
   }, [post.text, isSinglePost]);

   useEffect(() => {
       const checkFollowStatus = async () => {
           if (!post.author?._id || post.author._id === currentUserId) return;
           
           try {
               const token = localStorage.getItem('token');
               const response = await fetch(`http://localhost:5177/auth/user/${post.author._id}`, {
                   headers: {
                       'Authorization': `Bearer ${token}`
                   }
               });

               if (!response.ok) throw new Error('Failed to fetch follow status');
               
               const data = await response.json();
               setIsFollowing(data.user?.isFollowing || false);
           } catch (error) {
               console.error('Error checking follow status:', error);
           }
       };

       checkFollowStatus();
   }, [post.author?._id, currentUserId]);

   const handleLikeClick = async (e) => {
       e.preventDefault();
       e.stopPropagation();
       try {
           await onLike(post._id);
           const newIsLiked = !isLiked;
           setIsLiked(newIsLiked);
           setLikeCount(prevCount => newIsLiked ? prevCount + 1 : prevCount - 1);
       } catch (error) {
           console.error('Error handling like:', error);
       }
   };

   const handleFollowClick = async (e) => {
       e.preventDefault();
       e.stopPropagation();
       try {
           const token = localStorage.getItem('token');
           const response = await fetch(`http://localhost:5177/auth/user/${post.author._id}/follow`, {
               method: 'POST',
               headers: {
                   'Authorization': `Bearer ${token}`
               }
           });

           const data = await response.json();
           setIsFollowing(data.isFollowing);
       } catch (error) {
           console.error('Error toggling follow:', error);
       }
   };

   return (
       <div className="post-card">
           <div className="post-header">
               <Link to={`/profile/${post.author?._id || ''}`} className="author-info">
                   <div className="author-avatar-container">
                       <img 
                           src={post.author?.avatar || '/default-avatar.png'} 
                           alt={post.author?.displayName || 'Anonymous'}
                           className="author-avatar"
                       />
                   </div>
                   <div className="author-details">
                       <span className="author-name">{post.author?.displayName || 'Anonymous'}</span>
                       <span className="author-username">@{post.author?.username || 'user'}</span>
                   </div>
               </Link>
               <div className="post-header-actions">
                   {post.author?._id !== currentUserId ? (
                       <button 
                           className={`follow-button ${isFollowing ? 'following' : ''}`}
                           onClick={handleFollowClick}
                       >
                           {isFollowing ? 'Following' : 'Follow'}
                       </button>
                   ) : (
                       <div className="post-menu">
                           <button 
                               className="menu-dots"
                               onClick={() => setIsMenuOpen(!isMenuOpen)}
                           >
                               <MoreVertical size={20} />
                           </button>
                           {isMenuOpen && (
                               <div className="menu-dropdown">
                                   <button onClick={() => {
                                       setIsMenuOpen(false);
                                       onEditClick(post);
                                   }}>
                                       Edit Post
                                   </button>
                                   <button 
                                       className="delete-button"
                                       onClick={() => {
                                           setIsMenuOpen(false);
                                           onDeleteClick(post);
                                       }}
                                   >
                                       Delete Post
                                   </button>
                               </div>
                           )}
                       </div>
                   )}
               </div>
           </div>
           
           <div className="post-content-wrapper">
               <div className={`post-content ${isSinglePost ? 'single' : ''}`} ref={contentRef}>
                   <h2 className="post-title">{post.title || 'Untitled'}</h2>
                   <p className="post-text">{post.text || ''}</p>
                   {shouldShowMore && !isSinglePost && !isContentExpanded && (
                       <Link 
                           to={`/post/${post._id}`} 
                           className="show-more-button"
                       >
                           Show more
                           <ChevronDown size={20} />
                       </Link>
                   )}
                   <PostImages images={post.images} />
               </div>
               {!isSinglePost && (
                   <Link 
                       to={`/post/${post._id}`}
                       className="post-overlay-link"
                   />
               )}
           </div>

           <div className="post-actions">
               <button 
                   className={`action-button ${isLiked ? 'liked' : ''}`}
                   onClick={handleLikeClick}
               >
                   <Heart 
                       size={20}
                       fill={isLiked ? "#e31b23" : "none"}
                       color={isLiked ? "#e31b23" : "currentColor"}
                   />
                   {likeCount > 0 && <span>{likeCount}</span>}
               </button>
               <Link 
                   to={`/post/${post._id}`} 
                   state={{ focusComment: true }}
                   className="action-button"
               >
                   <MessageCircle size={20} />
               </Link>
           </div>
       </div>
   );
};

export default PostCard;