import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'
import { fetchHfiData, fetchNearbyGeohash } from './api/wxapi'

function App() {
  const [count, setCount] = useState(0)
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [geohash, setGeohash] = useState(null)
  const [wxApiLoading, setWxApiLoading] = useState(false)
  const [wxApiError, setWxApiError] = useState(null)
  const [weatherData, setWeatherData] = useState(null)
  const [hfiLoading, setHfiLoading] = useState(false)
  const [hfiError, setHfiError] = useState(null)

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
        let errorMessage = `Error: ${error.message}`;
        
        // Add helpful message for common permission errors
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage += "\n\nThis may be because:";
          errorMessage += "\n1. You denied permission";
          errorMessage += "\n2. You're not using HTTPS (required for geolocation except on localhost)";
          errorMessage += "\n3. Your browser's privacy settings are blocking geolocation";
          
          if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
            errorMessage += "\n\nTry accessing this site via HTTPS instead.";
          }
        }
        
        setError(errorMessage);
        setLoading(false);
        setShowManualInput(true);
      }
    )
  }

  useEffect(() => {
    return () => {
      if (countryDebounceTimerRef.current) {
        clearTimeout(countryDebounceTimerRef.current);
      }
      if (cityDebounceTimerRef.current) {
        clearTimeout(cityDebounceTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <h1>Location Finder</h1>

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
        
        
        {location && (
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
            
            {wxApiLoading && <p>Fetching weather data...</p>}
            
            {wxApiError && (
              <div className="error" style={{ color: 'red', margin: '10px 0' }}>
                {wxApiError}
              </div>
            )}
            
            {geohash && (
              <div style={{ margin: '15px 0', padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '5px' }}>
                <p><strong>Weather Location Geohash:</strong> {geohash}</p>
              </div>
            )}
            
            {hfiLoading && <p>Fetching Hair Forecast Index data...</p>}
            
            {hfiError && (
              <div className="error" style={{ color: 'red', margin: '10px 0' }}>
                {hfiError}
              </div>
            )}
            
            {weatherData && typeof weatherData === 'object' && (
              <div style={{ margin: '15px 0', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginTop: '0', color: '#333' }}>Weather &amp; Hair Forecast</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  {weatherData.temperature_f !== undefined && (
                    <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      <p style={{ fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Temperature</p>
                      <p style={{ fontSize: '1.2em', margin: '0' }}>{weatherData.temperature_f}°F</p>
                    </div>
                  )}
                  {weatherData.dewpoint_f !== undefined && (
                    <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      <p style={{ fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Dewpoint</p>
                      <p style={{ fontSize: '1.2em', margin: '0' }}>{weatherData.dewpoint_f}°F</p>
                    </div>
                  )}
                  {weatherData.wind_mph !== undefined && (
                    <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      <p style={{ fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Wind Speed</p>
                      <p style={{ fontSize: '1.2em', margin: '0' }}>{weatherData.wind_mph} mph</p>
                    </div>
                  )}
                </div>
                
                {weatherData.hfi !== undefined && (
                  <div style={{ 
                    marginTop: '15px', 
                    padding: '15px', 
                    backgroundColor: weatherData.hfi >= 8 ? '#e6f7ff' : weatherData.hfi >= 5 ? '#fff7e6' : '#ffe6e6',
                    borderRadius: '4px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    borderLeft: `4px solid ${weatherData.hfi >= 8 ? '#1890ff' : weatherData.hfi >= 5 ? '#faad14' : '#f5222d'}`
                  }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Hair Forecast Index (HFI)</h4>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ 
                      fontSize: '2em', 
                      fontWeight: 'bold',
                      color: weatherData.hfi >= 8 ? '#1890ff' : weatherData.hfi >= 5 ? '#faad14' : '#f5222d'
                    }}>
                      {weatherData.hfi}
                    </span>
                    <span style={{ 
                      padding: '5px 10px', 
                      borderRadius: '15px',
                      backgroundColor: weatherData.hfi >= 8 ? '#e6f7ff' : weatherData.hfi >= 5 ? '#fff7e6' : '#ffe6e6',
                      color: weatherData.hfi >= 8 ? '#1890ff' : weatherData.hfi >= 5 ? '#faad14' : '#f5222d',
                      fontWeight: 'bold',
                      border: `1px solid ${weatherData.hfi >= 8 ? '#91d5ff' : weatherData.hfi >= 5 ? '#ffd591' : '#ffa39e'}`
                    }}>
                      {weatherData.hfi >= 8 ? 'Great Hair Day' : weatherData.hfi >= 5 ? 'Moderate Hair Day' : 'Bad Hair Day'}
                    </span>
                  </div>
                  <p style={{ marginTop: '10px', color: '#666' }}>
                    {weatherData.hfi >= 8 
                      ? 'Perfect conditions for your hair! Low humidity and gentle winds mean your style should stay in place all day.'
                      : weatherData.hfi >= 5 
                        ? 'Some frizz possible. Consider using anti-frizz products today.'
                        : 'High frizz alert! Consider wearing your hair up or using strong hold products today.'}
                  </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default App
