import React from 'react';
import { Link } from 'react-router-dom';

const AuthPage = () => {
  return (
    <div className='auth'>
      <div className="auth_page_container">
        <h1 className="text-4xl font-bold mb-8">Welcome to PostVerse</h1>
        <div className="auth_nav">
          <Link
            to="/login"
            className="login_button"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="reg_button"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;