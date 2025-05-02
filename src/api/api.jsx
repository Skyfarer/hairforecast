// API functions for weather and geo data

/**
 * Fetches HFI (Hair Forecast Index) data using a geohash
 * @param {string} geohash - The geohash location code
 * @returns {Promise} - Promise that resolves to the HFI data
 */
export const fetchHfiData = async (geohash) => {
  try {
    const response = await fetch(`/wxapi/hfi?interval=0h&geohash=${geohash}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch HFI data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('HFI API response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching HFI data:', error);
    throw error;
  }
};

/**
 * Fetches nearby location data and returns geohash
 * @param {Object|string} location - Location object with lat/lon or location name string
 * @returns {Promise} - Promise that resolves to the nearby location data
 */
export const fetchNearbyGeohash = async (location) => {
  try {
    // Always use lat/lon parameters if available
    let url;
    if (location.latitude && location.longitude) {
      // Use coordinates
      url = `/wxapi/nearby?lat=${location.latitude}&lon=${location.longitude}`;
    } else if (typeof location === 'string') {
      // Fallback to location name if no coordinates
      url = `/wxapi/nearby?location=${encodeURIComponent(location)}`;
    } else {
      throw new Error('Invalid location format provided');
    }
    
    console.log(`Fetching weather data with URL: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch weather data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Weather API response:', data);
    
    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

/**
 * Fetches countries list with optional search query
 * @param {string} query - Optional search query to filter countries
 * @returns {Promise} - Promise that resolves to the countries data
 */
export const fetchCountries = async (query = '') => {
  try {
    const response = await fetch(`/geoapi/countries${query ? `?q=${encodeURIComponent(query)}` : ''}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch countries: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Countries API response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw error;
  }
};

/**
 * Fetches cities list for a specific country with optional search query
 * @param {string} countryId - The country ID to fetch cities for
 * @param {string} query - Optional search query to filter cities
 * @returns {Promise} - Promise that resolves to the cities data
 */
export const fetchCities = async (countryId, query = '') => {
  try {
    const url = `/geoapi/cities?country_id=${encodeURIComponent(countryId)}${query ? `&q=${encodeURIComponent(query)}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch cities: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Cities API response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw error;
  }
};
