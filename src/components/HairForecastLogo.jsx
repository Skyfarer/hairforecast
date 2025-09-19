import React from 'react';

const HairForecastLogo = ({ size = 'medium' }) => {
  const sizeStyles = {
    small: { width: '280px', height: 'auto' },
    medium: { width: '450px', height: 'auto' },
    large: { width: '600px', height: 'auto' }
  };

  // Detect dark mode preference
  const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const logoSrc = prefersDarkMode ? '/images/hf_logo_dark.png' : '/images/hf_logo_light.png';

  return (
    <div className="hair-forecast-logo" style={{ textAlign: 'center' }}>
      <img 
        src={logoSrc}
        alt="Hair Forecast Logo"
        style={{
          ...sizeStyles[size],
          objectFit: 'contain',
          objectPosition: 'center',
          display: 'block',
          margin: '0 auto'
        }}
      />
    </div>
  );
};

export default HairForecastLogo;