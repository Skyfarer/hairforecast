import { useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchHfiData, fetchNearbyGeohash, fetchCountries } from '../api/api';
import ManualLocationEntry from '../components/ManualLocationEntry';
import WeatherStatus from '../components/WeatherStatus';
import WeatherDisplay from '../components/WeatherDisplay';

function ManualLocationPage() {
  const [locationName, setLocationName] = useState(null);
  const [geohash, setGeohash] = useState(null);
  const [wxApiLoading, setWxApiLoading] = useState(false);
  const [wxApiError, setWxApiError] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [hfiLoading, setHfiLoading] = useState(false);
  const [hfiError, setHfiError] = useState(null);

  // Wrapper function for fetchHfiData with state management
  const fetchHfiDataWithState = async (geohash) => {
    setHfiLoading(true);
    setHfiError(null);
    setWeatherData(null);
    
    try {
      const data = await fetchHfiData(geohash);
      setWeatherData(data);
    } catch (error) {
      setHfiError(`Failed to fetch HFI data: ${error.message}`);
    } finally {
      setHfiLoading(false);
    }
  };

  // Wrapper function for fetchNearbyGeohash with state management
  const fetchNearbyGeohashWithState = async (location) => {
    setWxApiLoading(true);
    setWxApiError(null);
    setGeohash(null);
    
    try {
      const data = await fetchNearbyGeohash(location);
      
      if (data.results && data.results.length > 0) {
        const receivedGeohash = data.results[0].geohash;
        setGeohash(receivedGeohash);
        // Fetch HFI data using the geohash
        fetchHfiDataWithState(receivedGeohash);
      } else {
        console.warn('No geohash found in the response');
      }
    } catch (error) {
      setWxApiError(`Failed to fetch weather data: ${error.message}`);
    } finally {
      setWxApiLoading(false);
    }
  };

  const handleLocationSubmit = (location) => {
    setLocationName(location);
    fetchNearbyGeohashWithState(location);
  };

  return (
    <>
      <h1>Location Weather Lookup</h1>
      
      <div style={{ margin: '20px 0' }}>
        <Link to="/" style={{ 
          padding: '8px 16px', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '4px',
          textDecoration: 'none',
          color: '#333'
        }}>
          Back to Home
        </Link>
      </div>
      
      <ManualLocationEntry 
        onLocationSubmit={handleLocationSubmit}
        loading={wxApiLoading}
      />
      
      {locationName && (
        <div style={{ marginTop: '20px' }}>
          <h3>Weather for: {locationName}</h3>
          
          <WeatherStatus 
            wxApiLoading={wxApiLoading}
            wxApiError={wxApiError}
            geohash={geohash}
            hfiLoading={hfiLoading}
            hfiError={hfiError}
          />
          
          <WeatherDisplay weatherData={weatherData} />
        </div>
      )}
    </>
  );
}

export default ManualLocationPage;
