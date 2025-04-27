import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setLoading(true)
    setError(null)

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
      }
    )
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
        <button onClick={getLocation} disabled={loading}>
          {loading ? 'Getting location...' : 'Get My Location'}
        </button>
        
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
