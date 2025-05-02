import React from 'react';

const LocationFinder = ({ 
  loading, 
  getLocation, 
  error 
}) => {
  return (
    <div className="card">
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
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
