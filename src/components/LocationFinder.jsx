import React from 'react';

const LocationFinder = ({ 
  loading, 
  getLocation
}) => {
  return (
    <button 
      onClick={getLocation} 
      disabled={loading}
      style={{
        padding: '8px 16px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: '1px solid #4CAF50',
        borderRadius: '4px',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '1em',
        fontWeight: 'bold'
      }}
    >
      {loading ? 'Getting location...' : 'Get My Location'}
    </button>
  );
};

export default LocationFinder;
