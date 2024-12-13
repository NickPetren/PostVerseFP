import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('http://localhost:5177/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        console.log('Login response:', data);
        
        if (!response.ok) {
            throw new Error(data.message || 'Error logging in');
        }

        if (!data.token || !data.user) {
            throw new Error('Invalid response data');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        const savedToken = localStorage.getItem('token');
        console.log('Saved token:', savedToken);

        navigate('/');
    } catch (error) {
        console.error('Login error:', error);
        setError(error.message);
    }
  };

  return (
    <div className='login'>
      <div className='login_container'>
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mail_form"
              required
            />
          </div>
          <div className="mb-6">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="password_form"
              required
            />
          </div>
          <button
            type="submit"
            className="login_button"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;