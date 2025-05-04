// API functions for weather and geo data

/**
 * Fetches HFI (Hair Forecast Index) data using a geohash for multiple intervals
 * @param {string} geohash - The geohash location code
 * @param {Array} intervals - Array of intervals to fetch (e.g. ['0h', '6h', '12h', '18h'])
 * @returns {Promise} - Promise that resolves to an object with interval data
 */
export const fetchHfiData = async (geohash, intervals = ['0h', '6h', '12h', '18h']) => {
  try {
    // Create an object to store all interval data
    const allIntervalData = {};
    
    // Fetch data for each interval
    const promises = intervals.map(async (interval) => {
      const response = await fetch(`/wxapi/hfi?interval=${interval}&geohash=${geohash}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch HFI data for interval ${interval}: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`HFI API response for interval ${interval}:`, data);
      
      // Store the data with the interval as the key
      allIntervalData[interval] = data;
    });
    
    // Wait for all requests to complete
    await Promise.all(promises);
    
    return allIntervalData;
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
