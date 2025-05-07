import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchHfiData, fetchHfiSummary, fetchNearbyGeohash, fetchNearestCity } from '../api/api';
import LocationFinder from '../components/LocationFinder';
import LocationDisplay from '../components/LocationDisplay';
import WeatherStatus from '../components/WeatherStatus';
import WeatherDisplay from '../components/WeatherDisplay';

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

  return (
    <>
      <h1>Hair Forecast</h1>
      
      <div style={{ display: 'flex', gap: '15px', margin: '20px 0' }}>
        {/* Only show the Get My Location button if geolocation failed or wasn't attempted */}
        {(error || !geolocationAttempted) && (
          <LocationFinder 
            loading={loading}
            getLocation={getLocation}
            error={error}
          />
        )}
        
        <Link to="/manual-location" style={{ 
          padding: '8px 16px', 
          backgroundColor: '#4CAF50',
          color: 'white',
          borderRadius: '4px',
          textDecoration: 'none',
          fontWeight: 'bold',
          display: 'inline-block',
          height: 'fit-content'
        }}>
          Enter Location Manually
        </Link>
      </div>
      
      {error && (
        <div className="error" style={{ whiteSpace: 'pre-line', color: 'red', margin: '10px 0' }}>
          {error}
        </div>
      )}
      
      {location && (
        <div>
          <WeatherStatus 
            wxApiLoading={wxApiLoading}
            wxApiError={wxApiError}
            geohash={geohash}
            hfiLoading={hfiLoading}
            hfiError={hfiError}
          />
          
          {(summaryData || weatherData) && (
            <WeatherDisplay 
              weatherData={weatherData}
              summaryData={summaryData}
              useMetric={useMetric}
              onToggleUnits={() => setUseMetric(!useMetric)}
              showDetailView={showDetailView}
              onToggleView={() => {
                setShowDetailView(!showDetailView);
                // If switching to detail view and we don't have detailed data yet, fetch it
                if (!showDetailView && !weatherData && geohash) {
                  fetchHfiDataWithState(geohash);
                }
              }}
              cityData={cityData}
              cityLoading={cityLoading}
              cityError={cityError}
            />
          )}
        </div>
      )}
    </>
  )
}

export default HomePage;
