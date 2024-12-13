import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import logoImage from '../assets/image/logo_image.png';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className='header'>
      <Link to="/" className='logo'>
      <div className='logo-image-container'>
        <img src={logoImage} alt="" className='logo-image' />
      </div>
      
        PostVerse
      </Link>

      <form className="search-container" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search PostVerse..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="search-button">
          <Search size={20} />
        </button>
      </form>

      <nav>
        <Link to="/profile" className='profile-link'>
          <div className="header-avatar-container">
            <img 
              src={user?.avatar || '/default-avatar.png'} 
              alt={user?.displayName || 'Profile'} 
              className="header-avatar"
            />
          </div>
        </Link>
      </nav>
    </header>
  );
};

export default Header;