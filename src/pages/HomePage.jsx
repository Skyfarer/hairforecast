import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchHfiData, fetchHfiSummary, fetchNearbyGeohash, fetchNearestCity } from '../api/api';
import LocationFinder from '../components/LocationFinder';
import LocationDisplay from '../components/LocationDisplay';
import WeatherStatus from '../components/WeatherStatus';
import WeatherDisplay from '../components/WeatherDisplay';
import HairForecastLogo from '../components/HairForecastLogo';

function HomePage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [geolocationAttempted, setGeolocationAttempted] = useState(false);
  const [geohash, setGeohash] = useState(null);
  const [wxApiLoading, setWxApiLoading] = useState(false);
  const [wxApiError, setWxApiError] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [hfiLoading, setHfiLoading] = useState(false);
  const [hfiError, setHfiError] = useState(null);
  const [useMetric, setUseMetric] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);
  const [cityData, setCityData] = useState(null);
  const [cityLoading, setCityLoading] = useState(false);
  const [cityError, setCityError] = useState(null);

  // Wrapper function for fetchHfiSummary with state management
  const fetchHfiSummaryWithState = async (geohash) => {
    setHfiLoading(true);
    setHfiError(null);
    setSummaryData(null);
    
    try {
      // Fetch summary data
      const data = await fetchHfiSummary(geohash);
      setSummaryData(data);
      
      // If detail view is already active, also fetch detailed data
      if (showDetailView) {
        fetchHfiDataWithState(geohash);
      }
    } catch (error) {
      setHfiError(`Failed to fetch HFI summary: ${error.message}`);
    } finally {
      setHfiLoading(false);
    }
  };

  // Wrapper function for fetchHfiData with state management
  const fetchHfiDataWithState = async (geohash) => {
    setHfiLoading(true);
    setHfiError(null);
    setWeatherData(null);
    
    try {
      // Fetch data for the next 48 hours (API now returns all intervals)
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
        // Fetch HFI summary data using the geohash
        fetchHfiSummaryWithState(receivedGeohash);
      } else {
        console.warn('No geohash found in the response');
      }
    } catch (error) {
      setWxApiError(`Failed to fetch weather data: ${error.message}`);
    } finally {
      setWxApiLoading(false);
    }
  };

  // Wrapper function for fetchNearestCity with state management
  const fetchNearestCityWithState = async (latitude, longitude) => {
    setCityLoading(true);
    setCityError(null);
    setCityData(null);
    
    try {
      const data = await fetchNearestCity(latitude, longitude);
      if (data && data.city) {
        setCityData(data.city);
      } else {
        console.warn('No city data found in the response');
      }
    } catch (error) {
      setCityError(`Failed to fetch city data: ${error.message}`);
    } finally {
      setCityLoading(false);
    }
  };

  // Attempt geolocation when component mounts
  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setGeolocationAttempted(true);
      return;
    }

    setLoading(true);
    setError(null);

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
        
        // Fetch nearest city data
        fetchNearestCityWithState(lat, lon);
        
        setLoading(false);
        setGeolocationAttempted(true);
      },
      (error) => {
        console.log("Geolocation error:", error.message);
        setError(`Error: ${error.message}`);
        setLoading(false);
        setGeolocationAttempted(true);
      },
      { timeout: 10000 } // 10 second timeout for geolocation
    );
  };

  // Redirect to manual location entry if geolocation fails
  useEffect(() => {
    if (geolocationAttempted && error && !location) {
      // Wait a moment before redirecting to show the error
      const timer = setTimeout(() => {
        navigate('/manual-location');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [geolocationAttempted, error, location, navigate]);

  // Show weather results if we have location and data
  if (location && (summaryData || weatherData)) {
    return (
      <div style={{ minHeight: '100vh', padding: '20px 0' }}>
        <WeatherDisplay 
          weatherData={weatherData}
          summaryData={summaryData}
          useMetric={useMetric}
          onToggleUnits={() => setUseMetric(!useMetric)}
          showDetailView={showDetailView}
          onToggleView={() => {
            setShowDetailView(!showDetailView);
            if (!showDetailView && !weatherData && geohash) {
              fetchHfiDataWithState(geohash);
            }
          }}
          cityData={cityData}
          cityLoading={cityLoading}
          cityError={cityError}
          showLogo={true}
          onChangeLocation={() => navigate('/manual-location')}
        />
      </div>
    );
  }

  // Show initial loading/location screen
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      textAlign: 'center',
      padding: '20px'
    }}>
      <HairForecastLogo size="large" />
      
      <div className="card" style={{ 
        marginTop: '40px',
        width: '100%',
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        
        {loading && (
          <div style={{ 
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              background: 'var(--border-color)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <svg style={{ color: 'var(--text-secondary)' }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <div style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                width: '24px',
                height: '24px',
                background: '#ff6b6b',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px'
              }}>
                📍
              </div>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
              Getting Location
            </div>
          </div>
        )}
        
        {!loading && (
          <>
            {error && (
              <div style={{ 
                color: '#e74c3c', 
                margin: '0 0 20px 0',
                padding: '12px',
                background: '#fdf2f2',
                borderRadius: '8px',
                border: '1px solid #fecaca'
              }}>
                {error}
              </div>
            )}
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              background: 'var(--bg-primary)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              border: '2px solid var(--border-color)'
            }}>
              <svg style={{ marginRight: '12px', color: 'var(--text-secondary)' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                placeholder="Address, City or Country"
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  flex: 1,
                  color: 'var(--text-primary)',
                  fontSize: '16px'
                }}
                onClick={() => navigate('/manual-location')}
                readOnly
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {!geolocationAttempted && (
                <button 
                  className="btn-primary"
                  onClick={getLocation}
                  disabled={loading}
                >
                  Get My Location
                </button>
              )}
              
              <button 
                className="btn-secondary"
                onClick={() => navigate('/manual-location')}
              >
                Enter Manually
              </button>
            </div>
          </>
        )}
        
        <WeatherStatus 
          wxApiLoading={wxApiLoading}
          wxApiError={wxApiError}
          geohash={geohash}
          hfiLoading={hfiLoading}
          hfiError={hfiError}
        />
      </div>
    </div>
  )
}

export default HomePage;
