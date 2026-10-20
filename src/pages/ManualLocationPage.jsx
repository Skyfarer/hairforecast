import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchHfiData, fetchHfiSummary, fetchNearbyGeohash, fetchCountries } from '../api/api';
import ManualLocationEntry from '../components/ManualLocationEntry';
import WeatherStatus from '../components/WeatherStatus';
import WeatherDisplay from '../components/WeatherDisplay';
import HairForecastLogo from '../components/HairForecastLogo';

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

  // Show weather results if we have location and data
  if (locationName && (summaryData || weatherData)) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '20px 0',
          marginBottom: '20px'
        }}>
          <HairForecastLogo size="medium" />
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            background: 'var(--bg-secondary)',
            borderRadius: '8px',
            padding: '8px 16px',
            minWidth: '300px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow)'
          }}>
            <svg style={{ marginRight: '8px', color: 'var(--text-secondary)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <span style={{
              flex: 1,
              color: 'var(--text-primary)',
              fontSize: '14px'
            }}>
              {locationName}
            </span>
          </div>
        </header>

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
        />
        
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link to="/" className="btn-secondary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Show manual location entry screen
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
        <h2 style={{ 
          color: 'var(--text-primary)', 
          margin: '0 0 30px 0',
          fontSize: '32px',
          fontWeight: '600'
        }}>
          Enter Location
        </h2>
        
        <ManualLocationEntry 
          onLocationSubmit={handleLocationSubmit}
          loading={wxApiLoading}
        />
        
        <div style={{ marginTop: '20px' }}>
          <Link to="/" className="btn-secondary">
            Back to Home
          </Link>
        </div>
        
        <WeatherStatus 
          wxApiLoading={wxApiLoading}
          wxApiError={wxApiError}
          geohash={geohash}
          hfiLoading={hfiLoading}
          hfiError={hfiError}
        />
      </div>
    </div>
  );
}

export default ManualLocationPage;
