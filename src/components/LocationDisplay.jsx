import React from 'react';

const LocationDisplay = ({ location }) => {
  if (!location) return null;
  
  return (
    <div>
      <p>
        <a 
          href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on Google Maps
        </a>
      </p>
    </div>
  );
};

export default LocationDisplay;
