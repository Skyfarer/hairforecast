import React from 'react';

const LocationFinder = ({ 
  loading, 
  getLocation, 
  error 
}) => {
  return (
    <div className="card">
      <h2>Geolocation</h2>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
        <button onClick={getLocation} disabled={loading}>
          {loading ? 'Getting location...' : 'Get My Location'}
        </button>
      </div>
      
      {error && (
        <div className="error" style={{ whiteSpace: 'pre-line', color: 'red', margin: '10px 0' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default LocationFinder;
