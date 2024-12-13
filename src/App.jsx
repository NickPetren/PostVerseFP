import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import PostList from './components/PostList';
import Profile from './components/Profile';
import PostPage from './components/PostPage';
import CreatePostButton from './components/CreatePostButton';
import AuthPage from './components/Auth/AuthPage';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import PrivateRoute from './components/PrivateRoute';
import FollowersPage from './components/Profile/FollowersPage';
import FollowingPage from './components/Profile/FollowingPage';
import SearchResults from './components/SearchResults';
import SuggestedUsers from './components/SuggestedUsers';
import NotificationsPanel from './components/NotificationsPanel';
import TagPage from './components/TagPage';
import './styles/nexus.css';

function App() {
 return (
   <Router>
     <Routes>
       <Route path="/auth" element={<AuthPage />} />
       <Route path="/login" element={<LoginForm />} />
       <Route path="/register" element={<RegisterForm />} />
       <Route
         path="/"
         element={
           <PrivateRoute>
             <div>
               <Header />
               <div className="main-layout">
                 <div className="main-content">
                   <PostList />
                 </div>
                 <div className="right-sidebar">
                   <SuggestedUsers />
                   <NotificationsPanel />
                 </div>
               </div>
               <CreatePostButton />
             </div>
           </PrivateRoute>
         }
       />
       <Route
         path="/search"
         element={
           <PrivateRoute>
             <div>
               <Header />
               <SearchResults />
             </div>
           </PrivateRoute>
         }
       />
       <Route
         path="/post/:postId"
         element={
           <PrivateRoute>
             <div>
               <Header />
               <PostPage />
             </div>
           </PrivateRoute>
         }
       />
       <Route
         path="/profile"
         element={
           <PrivateRoute>
             <div>
               <Header />
               <Profile />
             </div>
           </PrivateRoute>
         }
       />
       <Route
         path="/profile/:userId"
         element={
           <PrivateRoute>
             <div>
               <Header />
               <Profile />
             </div>
           </PrivateRoute>
         }
       />
       <Route
         path="/profile/:userId/followers"
         element={
           <PrivateRoute>
             <div>
               <Header />
               <FollowersPage />
             </div>
           </PrivateRoute>
         }
       />
       <Route
         path="/profile/:userId/following"
         element={
           <PrivateRoute>
             <div>
               <Header />
               <FollowingPage />
             </div>
           </PrivateRoute>
         }
       />
       <Route
         path="/tag/:tagName"
         element={
           <PrivateRoute>
             <div>
               <Header />
               <TagPage />
             </div>
           </PrivateRoute>
         }
       />
       <Route path="*" element={<Navigate to="/auth" />} />
     </Routes>
   </Router>
 );
}

export default App;