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

  const handleManualLocationSubmit = async (e) => {
    e.preventDefault()
    if (manualLocation.city && manualLocation.country) {
      try {
        // Clear any previous geolocation data
        setLocation(null)
        setLoading(true)
        setError(null)
        
        console.log(`Submitting location: ${manualLocation.city}, ${manualLocation.country}`);
        
        // Get coordinates for the entered location
        const locationQuery = `${manualLocation.city}, ${manualLocation.country}`;
        console.log(`Using location query: ${locationQuery}`);
        
        // Use hardcoded coordinates for testing
        // In a real app, you would use a geocoding service here
        console.log(`Using hardcoded coordinates for location: ${locationQuery}`);
        
        // Default coordinates (New York City)
        let lat = 40.7128;
        let lng = -74.0060;
        
        console.log(`Using coordinates: ${lat}, ${lng}`);
        
        // Set the manual location info with coordinates
        setLocation({
          manualEntry: true,
          city: manualLocation.city,
          country: manualLocation.country,
          displayName: `${manualLocation.city}, ${manualLocation.country}`,
          latitude: lat,
          longitude: lng
        });
        
        // Fetch weather data using the coordinates
        await fetchNearbyGeohashWithState({
          latitude: lat,
          longitude: lng
        });
      } catch (error) {
        console.error('Error processing manual location:', error);
        setError(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    } else {
      setError('Please enter both city and country')
    }
  }

  useEffect(() => {
    // Check if we're on a secure context for geolocation
    if (window.isSecureContext) {
      console.log("Running in a secure context - geolocation should work");
    } else {
      console.log("Not running in a secure context - geolocation may not work");
      setError("Warning: This app is not running in a secure context (HTTPS). " +
               "Geolocation may not work in some browsers. " +
               "Try accessing via localhost or an HTTPS connection.");
    }
    // You can uncomment this if you want to get location on page load
    // getLocation()
  }, [])

  // Fetch country suggestions
  const fetchCountrySuggestions = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setCountrySuggestions([]);
      return;
    }
    
    setIsLoadingCountries(true);
    try {
      console.log(`Searching for countries with query: ${query}`);
      
      // In a real app, this would be an API call
      // For now, just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Return empty results for now
      setCountrySuggestions([]);
      
    } catch (error) {
      console.error('Error with country suggestions:', error);
      setCountrySuggestions([]);
    } finally {
      setIsLoadingCountries(false);
    }
  }, []);

  // Handle country input changes with debounce
  const handleCountryInputChange = (e) => {
    const value = e.target.value;
    setManualLocation({...manualLocation, country: value});
    
    // If user clears the country field, hide the city input
    if (!value.trim()) {
      setCountrySelected(false);
    }
    
    // Clear previous timer
    if (countryDebounceTimerRef.current) {
      clearTimeout(countryDebounceTimerRef.current);
    }
    
    // Set new timer for debounce
    countryDebounceTimerRef.current = setTimeout(() => {
      fetchCountrySuggestions(value);
    }, 300);
  };

  // Fetch city suggestions
  const fetchCitySuggestions = useCallback(async (query, countryId) => {
    if (!query || query.length < 2 || !countryId) {
      setCitySuggestions([]);
      return;
    }
    
    setIsLoadingCities(true);
    try {
      console.log(`Searching for cities with query: ${query} for country ID: ${countryId}`);
      
      // In a real app, this would be an API call
      // For now, just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Return empty results for now
      setCitySuggestions([]);
      
    } catch (error) {
      console.error('Error with city suggestions:', error);
      setCitySuggestions([]);
    } finally {
      setIsLoadingCities(false);
    }
  }, []);

  // Handle city input changes with debounce
  const handleCityInputChange = (e) => {
    const value = e.target.value;
    setManualLocation({...manualLocation, city: value});
    
    // Clear previous timer
    if (cityDebounceTimerRef.current) {
      clearTimeout(cityDebounceTimerRef.current);
    }
    
    // Set new timer for debounce
    cityDebounceTimerRef.current = setTimeout(() => {
      if (manualLocation.countryId) {
        fetchCitySuggestions(value, manualLocation.countryId);
      }
    }, 300);
  };

  // Handle city suggestion selection
  const handleCitySelect = async (city) => {
    // Handle both object format and string format
    const cityName = typeof city === 'object' ? city.name : city;
    const stateCode = typeof city === 'object' && city.state_code ? city.state_code : '';
    const displayName = stateCode ? `${cityName}, ${stateCode}` : cityName;
    
    console.log('Selected city:', displayName);
    
    setManualLocation({...manualLocation, city: displayName});
    setCitySuggestions([]);
    
    // Instead of auto-submitting the form, directly handle the API calls
    try {
      // Clear any previous geolocation data
      setLocation(null);
      setLoading(true);
      setError(null);
      
      console.log(`Processing selected location: ${displayName}, ${manualLocation.country}`);
      
      // Create a location query string
      const locationQuery = `${displayName}, ${manualLocation.country}`;
      
      console.log(`Using location query: ${locationQuery}`);
      
      // Use hardcoded coordinates for testing
      // In a real app, you would use a geocoding service here
      console.log(`Using hardcoded coordinates for location: ${locationQuery}`);
      
      // Default coordinates (New York City)
      let lat = 40.7128;
      let lng = -74.0060;
      
      console.log(`Using coordinates: ${lat}, ${lng}`);
      
      // Set the manual location info with coordinates
      setLocation({
        manualEntry: true,
        city: displayName,
        country: manualLocation.country,
        displayName: `${displayName}, ${manualLocation.country}`,
        latitude: lat,
        longitude: lng
      });
      
      // Fetch weather data using the coordinates
      await fetchNearbyGeohashWithState({
        latitude: lat,
        longitude: lng
      });
    } catch (error) {
      console.error('Error processing selected city:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle country suggestion selection
  const handleCountrySelect = (country) => {
    // Handle both object format and string format
    const countryName = typeof country === 'object' ? country.name : country;
    const countryId = typeof country === 'object' ? country.id : null;
    console.log('Selected country:', countryName, 'ID:', countryId);
    
    setManualLocation({...manualLocation, country: countryName, countryId: countryId, city: ''});
    setCountrySuggestions([]);
    setCitySuggestions([]);
    setCountrySelected(true);
  };

  // Focus on city input when manual input form appears
  useEffect(() => {
    if (showManualInput && cityInputRef.current) {
      cityInputRef.current.focus();
    }
  }, [showManualInput]);
  
  // Clear debounce timers on unmount
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
