import React from 'react';

const LoadingLogo = () => {
  return (
    <div className="loading-logo-container">
      <svg 
        width="100" 
        height="100" 
        viewBox="0 0 100 100"
        className="loading-logo"
      >
        {/* Контур буквы P - более толстый и округлый */}
        <path 
          d="M25 20 L25 80 M25 20 
             L60 20 
             C85 20 85 50 60 50 
             L25 50"
          className="letter-outline"
          fill="none"
          stroke="#7c8fd4"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Заполняющаяся анимация */}
        <path 
          d="M25 20 L25 80 M25 20 
             L60 20 
             C85 20 85 50 60 50 
             L25 50"
          className="letter-fill"
          fill="none"
          stroke="#7c8fd4"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default LoadingLogo;