import { useState } from 'react';

const ManualLocationEntry = ({ onLocationSubmit, loading }) => {
  const [locationInput, setLocationInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (locationInput.trim()) {
      onLocationSubmit(locationInput);
    }
  };

  return (
    <div>
      <h2>Enter Location Manually</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={locationInput}
          onChange={(e) => setLocationInput(e.target.value)}
          placeholder="Enter city name or address"
          disabled={loading}
          style={{ padding: '8px', marginRight: '10px', width: '250px' }}
        />
        <button 
          type="submit" 
          disabled={loading || !locationInput.trim()}
          style={{ padding: '8px 16px' }}
        >
          {loading ? 'Loading...' : 'Search'}
        </button>
      </form>
    </div>
  );
};

export default ManualLocationEntry;
