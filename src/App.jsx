import { useState, useEffect, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualLocation, setManualLocation] = useState({ city: '', country: '' })
  const cityInputRef = useRef(null)

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

  // Focus on city input when manual input form appears
  useEffect(() => {
    if (showManualInput && cityInputRef.current) {
      cityInputRef.current.focus();
    }
  }, [showManualInput]);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>

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
                <input
                  type="text"
                  id="country"
                  value={manualLocation.country}
                  onChange={(e) => setManualLocation({...manualLocation, country: e.target.value})}
                  style={{ padding: '8px', width: '100%', maxWidth: '300px' }}
                  required
                />
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
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
