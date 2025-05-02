import { useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchHfiData, fetchNearbyGeohash } from '../api/api';
import LocationFinder from '../components/LocationFinder';
import LocationDisplay from '../components/LocationDisplay';
import WeatherStatus from '../components/WeatherStatus';
import WeatherDisplay from '../components/WeatherDisplay';

function HomePage() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
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

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        setLocation({
          latitude: lat,
          longitude: lon
        });
        
        // Fetch weather data using the coordinates
        fetchNearbyGeohashWithState({latitude: lat, longitude: lon});
        
        setLoading(false);
      },
      (error) => {
        setError(`Error: ${error.message}`);
        setLoading(false);
      }
    )
  }

  return (
    <>
      <h1>Location Finder</h1>
      
      <LocationFinder 
        loading={loading}
        getLocation={getLocation}
        error={error}
      />
      
      <div style={{ margin: '20px 0' }}>
        <Link to="/manual-location" style={{ 
          padding: '8px 16px', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '4px',
          textDecoration: 'none',
          color: '#333'
        }}>
          Enter Location Manually
        </Link>
      </div>
      
      {location && (
        <div>
          <LocationDisplay location={location} />
          
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
  )
}

export default HomePage;
