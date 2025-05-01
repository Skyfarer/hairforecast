import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

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
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualLocation, setManualLocation] = useState({ city: '', country: '', countryId: null })
  const [countrySuggestions, setCountrySuggestions] = useState([])
  const [citySuggestions, setCitySuggestions] = useState([])
  const [isLoadingCountries, setIsLoadingCountries] = useState(false)
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [countrySelected, setCountrySelected] = useState(false)
  const cityInputRef = useRef(null)
  const countryDebounceTimerRef = useRef(null)
  const cityDebounceTimerRef = useRef(null)

  // Function to fetch HFI data using geohash
  const fetchHfiData = async (geohash) => {
    setHfiLoading(true);
    setHfiError(null);
    setWeatherData(null);
    
    try {
      const response = await fetch(`/wxapi/hfi?interval=0h&geohash=${geohash}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch HFI data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('HFI API response:', data);
      setWeatherData(data);
    } catch (error) {
      console.error('Error fetching HFI data:', error);
      setHfiError(`Failed to fetch HFI data: ${error.message}`);
    } finally {
      setHfiLoading(false);
    }
  };

  // Function to fetch weather data from wxapi
  const fetchNearbyGeohash = async (lat, lon) => {
    setWxApiLoading(true);
    setWxApiError(null);
    setGeohash(null);
    
    try {
      const response = await fetch(`/wxapi/nearby?lat=${lat}&lon=${lon}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch weather data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Weather API response:', data);
      
      if (data.results && data.results.length > 0) {
        const receivedGeohash = data.results[0].geohash;
        setGeohash(receivedGeohash);
        // Fetch HFI data using the geohash
        fetchHfiData(receivedGeohash);
      } else {
        console.warn('No geohash found in the response');
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setWxApiError(`Failed to fetch weather data: ${error.message}`);
    } finally {
      setWxApiLoading(false);
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setShowManualInput(true)
      return
    }

    setLoading(true)
    setError(null)
    setShowManualInput(false)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        setLocation({
          latitude: lat,
          longitude: lon
        });
        
        // Fetch weather data using the coordinates
        fetchNearbyGeohash(lat, lon);
        
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
        
        // Geocode the location to get coordinates
        const geocodeQuery = encodeURIComponent(`${manualLocation.city}, ${manualLocation.country}`);
        const geocodeResponse = await fetch(`/geoapi/geocode?address=${geocodeQuery}`);
        
        if (!geocodeResponse.ok) {
          throw new Error(`Failed to geocode address: ${geocodeResponse.status}`);
        }
        
        const geocodeData = await geocodeResponse.json();
        console.log('Geocode response:', geocodeData);
        
        if (geocodeData.results && geocodeData.results.length > 0) {
          const { lat, lng } = geocodeData.results[0].geometry.location;
          
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
          await fetchNearbyGeohash(lat, lng);
        } else {
          throw new Error('Could not find coordinates for this location');
        }
        
        setError(null);
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
      setShowManualInput(true);
    }
    // You can uncomment this if you want to get location on page load
    // getLocation()
  }, [])

  // Fetch country suggestions from API
  const fetchCountrySuggestions = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setCountrySuggestions([]);
      return;
    }
    
    setIsLoadingCountries(true);
    try {
      console.log(`Fetching countries with query: ${query}`);
      const response = await fetch(`/geoapi/countries?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch country suggestions: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('API response:', data);
      
      // Extract the countries array from the response
      if (data.countries && Array.isArray(data.countries)) {
        console.log(`Found ${data.countries.length} country suggestions`);
        setCountrySuggestions(data.countries);
      } else {
        console.error('Unexpected API response format:', data);
        // If data itself is an array, try using that
        if (Array.isArray(data)) {
          console.log('Using data array directly');
          setCountrySuggestions(data);
        } else {
          setCountrySuggestions([]);
        }
      }
    } catch (error) {
      console.error('Error fetching country suggestions:', error);
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

  // Fetch city suggestions from API
  const fetchCitySuggestions = useCallback(async (query, countryId) => {
    if (!query || query.length < 2 || !countryId) {
      setCitySuggestions([]);
      return;
    }
    
    setIsLoadingCities(true);
    try {
      console.log(`Fetching cities with query: ${query} for country ID: ${countryId}`);
      const response = await fetch(`/geoapi/cities?country_id=${countryId}&q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch city suggestions: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('City API response:', data);
      
      // Extract the cities array from the response
      if (data.cities && Array.isArray(data.cities)) {
        console.log(`Found ${data.cities.length} city suggestions`);
        setCitySuggestions(data.cities);
      } else {
        console.error('Unexpected API response format for cities:', data);
        // If data itself is an array, try using that
        if (Array.isArray(data)) {
          console.log('Using data array directly for cities');
          setCitySuggestions(data);
        } else {
          setCitySuggestions([]);
        }
      }
    } catch (error) {
      console.error('Error fetching city suggestions:', error);
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
  const handleCitySelect = (city) => {
    // Handle both object format and string format
    const cityName = typeof city === 'object' ? city.name : city;
    const stateCode = typeof city === 'object' && city.state_code ? city.state_code : '';
    const displayName = stateCode ? `${cityName}, ${stateCode}` : cityName;
    
    console.log('Selected city:', displayName);
    
    setManualLocation({...manualLocation, city: displayName});
    setCitySuggestions([]);
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
          <button 
            onClick={() => setShowManualInput(!showManualInput)}
            style={{ 
              backgroundColor: showManualInput ? '#4caf50' : '#646cff',
            }}
          >
            {showManualInput ? 'Hide Manual Input' : 'Enter Location Manually'}
          </button>
        </div>
        
        {error && (
          <div className="error" style={{ whiteSpace: 'pre-line', color: 'red', margin: '10px 0' }}>
            {error}
          </div>
        )}
        
        {showManualInput && (
          <div className="manual-location-form" style={{ margin: '15px 0', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h3>Enter your location manually</h3>
            <form onSubmit={handleManualLocationSubmit}>
              <div style={{ margin: '10px 0' }}>
                <label htmlFor="country" style={{ display: 'block', marginBottom: '5px' }}>Country:</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    id="country"
                    value={manualLocation.country}
                    onChange={handleCountryInputChange}
                    style={{ padding: '8px', width: '100%', maxWidth: '300px' }}
                    required
                    autoComplete="off"
                  />
                  {isLoadingCountries && (
                    <div style={{ position: 'absolute', right: '10px', top: '8px', fontSize: '14px' }}>
                      Loading...
                    </div>
                  )}
                  {countrySuggestions.length > 0 && (
                    <ul style={{ 
                      position: 'absolute', 
                      zIndex: 10,
                      width: '100%', 
                      maxWidth: '300px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      backgroundColor: 'white',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '0',
                      margin: '0',
                      listStyle: 'none',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      {countrySuggestions.map((country, index) => {
                        console.log('Rendering country:', country);
                        // Handle both object format and string format
                        const countryName = typeof country === 'object' ? country.name : country;
                        const countryId = typeof country === 'object' ? country.id : index;
                        
                        return (
                          <li 
                            key={countryId}
                            onClick={() => handleCountrySelect(country)}
                            style={{
                              padding: '8px 12px',
                              cursor: 'pointer',
                              borderBottom: index < countrySuggestions.length - 1 ? '1px solid #eee' : 'none',
                              color: '#213547', // Dark text color for better contrast
                              fontWeight: '400'
                            }}
                            onMouseOver={(e) => {
                              e.target.style.backgroundColor = '#f0f0f0';
                              e.target.style.color = '#000';
                              e.target.style.fontWeight = '500';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.backgroundColor = 'transparent';
                              e.target.style.color = '#213547';
                              e.target.style.fontWeight = '400';
                            }}
                          >
                            {countryName}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  </div>
              </div>
              {countrySelected && (
                <div style={{ margin: '10px 0', animation: 'fadeIn 0.3s' }}>
                  <label htmlFor="city" style={{ display: 'block', marginBottom: '5px' }}>City:</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      ref={cityInputRef}
                      type="text"
                      id="city"
                      value={manualLocation.city}
                      onChange={handleCityInputChange}
                      style={{ padding: '8px', width: '100%', maxWidth: '300px' }}
                      required
                      autoComplete="off"
                    />
                    {isLoadingCities && (
                      <div style={{ position: 'absolute', right: '10px', top: '8px', fontSize: '14px' }}>
                        Loading...
                      </div>
                    )}
                    {citySuggestions.length > 0 && (
                      <ul style={{ 
                        position: 'absolute', 
                        zIndex: 10,
                        width: '100%', 
                        maxWidth: '300px',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '0',
                        margin: '0',
                        listStyle: 'none',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}>
                        {citySuggestions.map((city, index) => {
                          console.log('Rendering city:', city);
                          // Handle both object format and string format
                          const cityName = typeof city === 'object' ? city.name : city;
                          const cityId = typeof city === 'object' ? city.id : index;
                          const stateCode = typeof city === 'object' && city.state_code ? city.state_code : '';
                          const displayName = stateCode ? `${cityName}, ${stateCode}` : cityName;
                          
                          return (
                            <li 
                              key={cityId}
                              onClick={() => handleCitySelect(city)}
                              style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                borderBottom: index < citySuggestions.length - 1 ? '1px solid #eee' : 'none',
                                color: '#213547', // Dark text color for better contrast
                                fontWeight: '400'
                              }}
                              onMouseOver={(e) => {
                                e.target.style.backgroundColor = '#f0f0f0';
                                e.target.style.color = '#000';
                                e.target.style.fontWeight = '500';
                              }}
                              onMouseOut={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = '#213547';
                                e.target.style.fontWeight = '400';
                              }}
                            >
                              {displayName}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              )}
              <button 
                type="submit" 
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#646cff', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                Set Location
              </button>
            </form>
          </div>
        )}
        
        {location && (
          <div>
            {location.manualEntry ? (
              <>
                <p>Your location:</p>
                <p>{location.displayName}</p>
                {location.latitude && location.longitude && (
                  <p>Coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</p>
                )}
                <p>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.displayName)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Google Maps
                  </a>
                </p>
              </>
            ) : (
              <>
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
              </>
            )}
            
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
