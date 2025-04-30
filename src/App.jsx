import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualLocation, setManualLocation] = useState({ city: '', country: '' })
  const [countrySuggestions, setCountrySuggestions] = useState([])
  const [isLoadingCountries, setIsLoadingCountries] = useState(false)
  const cityInputRef = useRef(null)
  const countryDebounceTimerRef = useRef(null)

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
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
        setLoading(false)
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

  const handleManualLocationSubmit = (e) => {
    e.preventDefault()
    if (manualLocation.city && manualLocation.country) {
      // Clear any previous geolocation data
      setLocation(null)
      // Set the manual location info
      setLocation({
        manualEntry: true,
        city: manualLocation.city,
        country: manualLocation.country,
        displayName: `${manualLocation.city}, ${manualLocation.country}`
      })
      setError(null)
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
      const response = await fetch(`/api/countries?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch country suggestions');
      }
      const data = await response.json();
      // Extract the countries array from the response
      if (data.countries && Array.isArray(data.countries)) {
        setCountrySuggestions(data.countries);
      } else {
        console.error('Unexpected API response format:', data);
        setCountrySuggestions([]);
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
    
    // Clear previous timer
    if (countryDebounceTimerRef.current) {
      clearTimeout(countryDebounceTimerRef.current);
    }
    
    // Set new timer for debounce
    countryDebounceTimerRef.current = setTimeout(() => {
      fetchCountrySuggestions(value);
    }, 300);
  };

  // Handle country suggestion selection
  const handleCountrySelect = (country) => {
    setManualLocation({...manualLocation, country: country.name});
    setCountrySuggestions([]);
  };

  // Focus on city input when manual input form appears
  useEffect(() => {
    if (showManualInput && cityInputRef.current) {
      cityInputRef.current.focus();
    }
  }, [showManualInput]);
  
  // Clear debounce timer on unmount
  useEffect(() => {
    return () => {
      if (countryDebounceTimerRef.current) {
        clearTimeout(countryDebounceTimerRef.current);
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
                <label htmlFor="city" style={{ display: 'block', marginBottom: '5px' }}>City:</label>
                <input
                  ref={cityInputRef}
                  type="text"
                  id="city"
                  value={manualLocation.city}
                  onChange={(e) => setManualLocation({...manualLocation, city: e.target.value})}
                  style={{ padding: '8px', width: '100%', maxWidth: '300px' }}
                  required
                />
              </div>
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
                      {countrySuggestions.map((country, index) => (
                        <li 
                          key={country.id}
                          onClick={() => handleCountrySelect(country)}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            borderBottom: index < countrySuggestions.length - 1 ? '1px solid #eee' : 'none',
                            hover: { backgroundColor: '#f5f5f5' }
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          {country.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
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
          </div>
        )}
      </div>
    </>
  )
}

export default App
