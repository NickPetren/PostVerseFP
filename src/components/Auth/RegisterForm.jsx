import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    username: '',
    avatar: null
  });
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    //console.log('Original file:', file)
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = 500;
          canvas.height = 500;
          
          const size = Math.min(img.width, img.height);
          const x = (img.width - size) / 2;
          const y = (img.height - size) / 2;

          //console.log('Image dimensions:', { 
            //width: img.width, 
            //height: img.height, 
            //size, 
            //x, 
            //y 
          //});
          
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          ctx.drawImage(
            img,
            x, y, size, size,
            0, 0, 500, 500
          );
          
          const resizedImage = canvas.toDataURL('image/jpeg', 0.8);
          //console.log('Resized image created');
          
          setPreviewUrl(resizedImage);
          setFormData(prev => ({ ...prev, avatar: resizedImage }));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (formData.email && formData.password) {
      setStep(2);
    }
  };

  const generateUsername = (displayName) => {
    return displayName.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const username = generateUsername(formData.displayName);
      const response = await fetch('http://localhost:5177/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          username
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error registering');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  };

  if (step === 1) {
    return (
      <div className='auth'>
        <div className='auth_container'>
          <h2>Create Account</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleNextStep}>
            <div className="mb-4">
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="mail_form"
                required
              />
            </div>
            <div className="mb-6">
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="password_form"
                required
              />
            </div>
            <button type="submit" className="reg_button">
              Next
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className='auth'>
      <div className='auth_container'>
        <h2>Complete Your Profile</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className='profile_complete'>
          <div className="photo_upload">
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Profile preview" 
                className="avatar-preview"
              />
            ) : (
              <div className="avatar-placeholder">
                <span>Add Photo</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
              required
            />
          </div>
          <div className="mb-6">
            <input
              type="text"
              placeholder="Username"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                displayName: e.target.value 
              }))}
              className="username_form"
              required
            />
          </div>
          <div className="username-preview mb-4">
            @{generateUsername(formData.displayName)}
          </div>
          <button type="submit" className="reg_button">
            Complete Registration
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;