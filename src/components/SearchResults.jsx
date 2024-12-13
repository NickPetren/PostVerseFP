import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { UserResult } from './UserResult';
import PostCard from './PostCard';
import { BASIC_TAGS } from '../basicTags';

const SearchResults = () => {
 const [searchParams] = useSearchParams();
 const [results, setResults] = useState({ users: [], posts: [] });
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [selectedTags, setSelectedTags] = useState([]);
 const query = searchParams.get('q');
 const currentUser = JSON.parse(localStorage.getItem('user'));

 const handleTagToggle = (tagName) => {
    console.log('Current selected tags:', selectedTags);
    console.log('Toggling tag:', tagName);
  
    setSelectedTags(prev => {
        
        if (prev.includes(tagName)) {
            console.log('Removing tag:', tagName);
            return prev.filter(tag => tag !== tagName);
        } else {
            
            console.log('Adding tag:', tagName);
            return [...prev, tagName];
        }
    });
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

       
       setResults(prevResults => ({
           ...prevResults,
           posts: prevResults.posts.map(post => 
               post._id === postId 
                   ? { ...post, likes: post.likes.includes(currentUser.id) 
                       ? post.likes.filter(id => id !== currentUser.id)
                       : [...post.likes, currentUser.id] }
                   : post
           )
       }));
   } catch (error) {
       console.error('Error liking post:', error);
   }
 };

 useEffect(() => {
   const fetchResults = async () => {
       setLoading(true);
       try {
           const token = localStorage.getItem('token');
           let postsData = [];

           if (selectedTags.length > 0) {
               
               const tagPromises = selectedTags.map(tag =>
                   fetch(`http://localhost:5177/posts/tag/${tag}`, {
                       headers: {
                           'Authorization': `Bearer ${token}`
                       }
                   }).then(res => res.json())
               );
               
               const tagResults = await Promise.all(tagPromises);
               
               const allPosts = tagResults.flatMap(result => result.posts);
               postsData = [...new Map(allPosts.map(post => [post._id, post])).values()];
           }

           if (query && !selectedTags.length) {
               const [usersResponse, postsResponse] = await Promise.all([
                   fetch(`http://localhost:5177/search/users?q=${query}`, {
                       headers: {
                           'Authorization': `Bearer ${token}`
                       }
                   }),
                   fetch(`http://localhost:5177/search/posts?q=${query}`, {
                       headers: {
                           'Authorization': `Bearer ${token}`
                       }
                   })
               ]);

               if (!usersResponse.ok || !postsResponse.ok) {
                   throw new Error('Failed to fetch search results');
               }

               const [usersData, searchPostsData] = await Promise.all([
                   usersResponse.json(),
                   postsResponse.json()
               ]);

               setResults({
                   users: usersData,
                   posts: searchPostsData
               });
           } else {
               setResults({
                   users: [],
                   posts: postsData
               });
           }
       } catch (error) {
           setError(error.message);
       } finally {
           setLoading(false);
       }
   };

   fetchResults();
 }, [query, selectedTags, currentUser.id]);

 if (loading) {
   return <div className="search-loading">Searching...</div>;
 }

 if (error) {
   return <div className="search-error">Error: {error}</div>;
 }

 return (
   <div className="search-results">
     <div className="basic-tags-filter">
       <h3>Filter by tag:</h3>
       <div className="basic-tags-list">
          {BASIC_TAGS.map(tag => (
            <button
                key={tag.id}
                className={`basic-tag ${selectedTags.includes(tag.name) ? 'selected' : ''}`}
                onClick={() => handleTagToggle(tag.name)}
            >
                {tag.label}
            </button>
          ))}
       </div>
     </div>
     
     {query && !selectedTags.length && (
       <h2 className="search-query">Search results for: {query}</h2>
     )}
     
     {selectedTags.length > 0 && (
       <h2 className="search-query">
           Posts tagged with: {selectedTags.map(tag => `#${tag}`).join(', ')}
       </h2>
     )}

     {!query && !selectedTags.length && (
       <div className="no-query">
         Use the search bar or select tags to find posts
       </div>
     )}

     {query && !selectedTags.length && results.users.length > 0 && (
       <div className="users-results">
         <h3>Users</h3>
         <div className="users-grid">
           {results.users.map(user => (
             <UserResult key={user._id} user={user} />
           ))}
         </div>
       </div>
     )}

     {results.posts.length > 0 ? (
       <div className="posts-results">
         <h3>{selectedTags.length > 0 ? 'Tagged Posts' : 'Posts'}</h3>
         <div className="posts-grid">
           {results.posts.map(post => (
             <PostCard
               key={post._id}
               post={post}
               currentUserId={currentUser.id}
               onLike={handleLike}
               isSinglePost={false}
             />
           ))}
         </div>
       </div>
     ) : (
       query || selectedTags.length > 0 ? (
         <div className="no-results">
           No posts found {selectedTags.length > 0 
             ? `with tag${selectedTags.length > 1 ? 's' : ''} ${selectedTags.map(tag => `#${tag}`).join(', ')}`
             : `for "${query}"`}
         </div>
       ) : null
     )}
   </div>
 );
};

export default SearchResults;