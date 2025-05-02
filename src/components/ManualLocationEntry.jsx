import { useState, useEffect, useRef } from 'react';
import { fetchCountries } from '../api/api';

const ManualLocationEntry = ({ onLocationSubmit, loading }) => {
  const [countryInput, setCountryInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [fetchingCountries, setFetchingCountries] = useState(false);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    // Add click outside listener to close suggestions
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchCountrySuggestions = async () => {
      if (countryInput.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setFetchingCountries(true);
      try {
        const data = await fetchCountries(countryInput);
        if (data && Array.isArray(data.countries)) {
          setSuggestions(data.countries);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching country suggestions:', error);
        setSuggestions([]);
      } finally {
        setFetchingCountries(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchCountrySuggestions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [countryInput]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (countryInput.trim()) {
      onLocationSubmit(countryInput);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (country) => {
    setCountryInput(country.name);
    onLocationSubmit(country.name);
    setShowSuggestions(false);
  };

  return (
    <div>
      <h2>Select a Country</h2>
      <div style={{ position: 'relative' }} ref={suggestionsRef}>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={countryInput}
            onChange={(e) => {
              setCountryInput(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Start typing a country name"
            disabled={loading}
            style={{ 
              padding: '8px', 
              marginRight: '10px', 
              width: '250px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
          <button 
            type="submit" 
            disabled={loading || !countryInput.trim()}
            style={{ 
              padding: '8px 16px',
              borderRadius: '4px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              cursor: loading || !countryInput.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Loading...' : 'Search'}
          </button>
        </form>
        
        {showSuggestions && suggestions.length > 0 && (
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
            {suggestions.map((country, index) => (
              <li 
                key={index}
                onClick={() => handleSuggestionClick(country)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  color: '#333',
                  backgroundColor: 'white',
                  borderBottom: index < suggestions.length - 1 ? '1px solid #eee' : 'none'
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
            Loading suggestions...
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualLocationEntry;
