import { useState, useEffect, useRef } from 'react';
import { fetchCountries, fetchCities } from '../api/api';

const ManualLocationEntry = ({ onLocationSubmit, loading }) => {
  const [countryInput, setCountryInput] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countrySuggestions, setCountrySuggestions] = useState([]);
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [fetchingCountries, setFetchingCountries] = useState(false);
  
  const [cityInput, setCityInput] = useState('');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [fetchingCities, setFetchingCities] = useState(false);
  
  const countrySuggestionsRef = useRef(null);
  const citySuggestionsRef = useRef(null);

  // Handle clicks outside of suggestion dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countrySuggestionsRef.current && !countrySuggestionsRef.current.contains(event.target)) {
        setShowCountrySuggestions(false);
      }
      if (citySuggestionsRef.current && !citySuggestionsRef.current.contains(event.target)) {
        setShowCitySuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch country suggestions when user types
  useEffect(() => {
    const fetchCountrySuggestions = async () => {
      if (countryInput.trim().length < 2) {
        setCountrySuggestions([]);
        return;
      }

      setFetchingCountries(true);
      try {
        const data = await fetchCountries(countryInput);
        if (data && Array.isArray(data.countries)) {
          setCountrySuggestions(data.countries);
        } else {
          setCountrySuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching country suggestions:', error);
        setCountrySuggestions([]);
      } finally {
        setFetchingCountries(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchCountrySuggestions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [countryInput]);

  // Fetch city suggestions when user types and a country is selected
  useEffect(() => {
    if (!selectedCountry) return;
    
    const fetchCitySuggestions = async () => {
      if (cityInput.trim().length < 2) {
        setCitySuggestions([]);
        return;
      }

      setFetchingCities(true);
      try {
        const data = await fetchCities(selectedCountry.id, cityInput);
        if (data && Array.isArray(data.cities)) {
          setCitySuggestions(data.cities);
        } else {
          setCitySuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching city suggestions:', error);
        setCitySuggestions([]);
      } finally {
        setFetchingCities(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchCitySuggestions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [cityInput, selectedCountry]);

  const handleCountrySelect = (country) => {
    setCountryInput(country.name);
    setSelectedCountry(country);
    setShowCountrySuggestions(false);
    setCityInput('');
    setCitySuggestions([]);
  };

  const handleCitySelect = (city) => {
    setCityInput(city.name);
    setShowCitySuggestions(false);
    
    // Format the location with city, state (if available), and country for display
    const locationString = city.state_code 
      ? `${city.name}, ${city.state_code}, ${selectedCountry.name}`
      : `${city.name}, ${selectedCountry.name}`;
    
    // Pass both the display name and coordinates if available
    if (city.latitude && city.longitude) {
      onLocationSubmit({
        displayName: locationString,
        latitude: city.latitude,
        longitude: city.longitude,
        country: selectedCountry.name
      });
    } else {
      // Fallback to just the string if no coordinates
      onLocationSubmit(locationString);
    }
  };

  // Reset everything when changing country
  const handleCountryInputChange = (e) => {
    const value = e.target.value;
    setCountryInput(value);
    setShowCountrySuggestions(true);
    
    if (selectedCountry && value !== selectedCountry.name) {
      setSelectedCountry(null);
      setCityInput('');
      setCitySuggestions([]);
    }
  };

  return (
    <div>
      <h2>Hair Forecast</h2>
      
      {/* Country Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Country:
        </label>
        <div style={{ position: 'relative' }} ref={countrySuggestionsRef}>
          <input
            type="text"
            value={countryInput}
            onChange={handleCountryInputChange}
            onFocus={() => setShowCountrySuggestions(true)}
            placeholder="Start typing a country name"
            disabled={loading}
            style={{ 
              padding: '8px', 
              width: '250px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
          
          {showCountrySuggestions && countrySuggestions.length > 0 && (
            <ul style={{
              position: 'absolute',
              width: '250px',
              maxHeight: '200px',
              overflowY: 'auto',
              listStyle: 'none',
              padding: '0',
              margin: '0',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              zIndex: 10
            }}>
              {countrySuggestions.map((country, index) => (
                <li 
                  key={index}
                  onClick={() => handleCountrySelect(country)}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    color: '#333',
                    backgroundColor: 'white',
                    borderBottom: index < countrySuggestions.length - 1 ? '1px solid #eee' : 'none'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  {country.name}
                </li>
              ))}
            </ul>
          )}
          
          {fetchingCountries && (
            <div style={{ marginTop: '8px', color: '#666' }}>
              Loading countries...
            </div>
          )}
        </div>
      </div>
      
      {/* City Selection - Only show when a country is selected */}
      {selectedCountry && (
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            City:
          </label>
          <div style={{ position: 'relative' }} ref={citySuggestionsRef}>
            <input
              type="text"
              value={cityInput}
              onChange={(e) => {
                setCityInput(e.target.value);
                setShowCitySuggestions(true);
              }}
              onFocus={() => setShowCitySuggestions(true)}
              placeholder={`Start typing a city in ${selectedCountry.name}`}
              disabled={loading}
              style={{ 
                padding: '8px', 
                width: '250px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
            
            {showCitySuggestions && citySuggestions.length > 0 && (
              <ul style={{
                position: 'absolute',
                width: '250px',
                maxHeight: '200px',
                overflowY: 'auto',
                listStyle: 'none',
                padding: '0',
                margin: '0',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                zIndex: 10
              }}>
                {citySuggestions.map((city, index) => (
                  <li 
                    key={index}
                    onClick={() => handleCitySelect(city)}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      color: '#333',
                      backgroundColor: 'white',
                      borderBottom: index < citySuggestions.length - 1 ? '1px solid #eee' : 'none'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    {city.name}{city.state_code ? `, ${city.state_code}` : ''}
                  </li>
                ))}
              </ul>
            )}
            
            {fetchingCities && (
              <div style={{ marginTop: '8px', color: '#666' }}>
                Loading cities...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualLocationEntry;
