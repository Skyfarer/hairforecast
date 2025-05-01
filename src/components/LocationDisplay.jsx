import React from 'react';

const LocationDisplay = ({ location }) => {
  if (!location) return null;
  
  return (
    <div>
      <p>Your coordinates:</p>
      <p>Latitude: {location.latitude}</p>
      <p>Longitude: {location.longitude}</p>
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
