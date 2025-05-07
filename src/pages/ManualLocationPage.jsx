import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchHfiData, fetchHfiSummary, fetchNearbyGeohash, fetchCountries } from '../api/api';
import ManualLocationEntry from '../components/ManualLocationEntry';
import WeatherStatus from '../components/WeatherStatus';
import WeatherDisplay from '../components/WeatherDisplay';

function ManualLocationPage() {
  const [locationName, setLocationName] = useState(null);
  const [geohash, setGeohash] = useState(null);
  const [wxApiLoading, setWxApiLoading] = useState(false);
  const [wxApiError, setWxApiError] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [hfiLoading, setHfiLoading] = useState(false);
  const [hfiError, setHfiError] = useState(null);
  const [useMetric, setUseMetric] = useState(true); // Default to metric for most countries
  const [showDetailView, setShowDetailView] = useState(false);

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

  const handleLocationSubmit = (location) => {
    // If location is an object with coordinates and display name
    if (location && typeof location === 'object' && location.displayName) {
      setLocationName(location.displayName);
      // Use coordinates for more accurate geohash lookup
      fetchNearbyGeohashWithState({
        latitude: location.latitude,
        longitude: location.longitude
      });
    } else {
      // Fallback to string-based lookup
      setLocationName(location);
      fetchNearbyGeohashWithState(location);
    }
  };
  
  // Set units based on selected country
  useEffect(() => {
    if (locationName) {
      // Check if the location contains "United States" to set imperial units
      const isUS = locationName.toLowerCase().includes('united states');
      setUseMetric(!isUS); // Use imperial (false) for US, metric (true) for others
    }
  }, [locationName]);

  return (
    <>
      <h1>Hair Forecast</h1>
      
      <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
        <Link to="/" style={{ 
          padding: '8px 16px', 
          backgroundColor: '#4CAF50',
          color: 'white',
          borderRadius: '4px',
          textDecoration: 'none',
          fontWeight: 'bold',
          display: 'inline-block'
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
            />
          )}
        </div>
      )}
    </>
  );
}

export default ManualLocationPage;
