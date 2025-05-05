// API functions for weather and geo data

/**
 * Fetches HFI (Hair Forecast Index) data using a geohash
 * @param {string} geohash - The geohash location code
 * @returns {Promise} - Promise that resolves to an object with forecast data for the next 48 hours
 */
export const fetchHfiData = async (geohash) => {
  try {
    const response = await fetch(`/wxapi/hfi?geohash=${geohash}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch HFI data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('HFI API response:', data);
    console.log('HFI API response type:', typeof data);
    console.log('HFI API response keys:', Object.keys(data));
    
    // Log the first level of nested objects/arrays
    Object.keys(data).forEach(key => {
      const value = data[key];
      console.log(`Key ${key} type:`, typeof value);
      if (Array.isArray(value)) {
        console.log(`Key ${key} is array with ${value.length} items`);
        if (value.length > 0) {
          console.log(`First item in ${key}:`, value[0]);
        }
      } else if (typeof value === 'object' && value !== null) {
        console.log(`Key ${key} object keys:`, Object.keys(value));
      }
    });
    
    // Format the data into an object with intervals as keys for backward compatibility
    const formattedData = {};
    
    // The API now returns an array of forecasts at 6-hour intervals
    if (data && Array.isArray(data.forecasts)) {
      data.forecasts.forEach((forecast, index) => {
        // Use the hour offset as the key (0h, 6h, 12h, etc.)
        const hourOffset = index * 6;
        formattedData[`${hourOffset}h`] = forecast;
      });
    } else if (data && data.forecast && Array.isArray(data.forecast)) {
      // Alternative API format with 'forecast' property
      data.forecast.forEach((forecast, index) => {
        const hourOffset = index * 6;
        formattedData[`${hourOffset}h`] = forecast;
      });
    } else if (data && typeof data === 'object') {
      // If the API returns a single forecast object instead of an array
      // Check if this is the entire forecast object or just one entry
      if (data.hfi !== undefined || data.temperature_f !== undefined) {
        formattedData['0h'] = data;
      } else {
        // Try to extract forecast data from other possible structures
        const possibleArrays = Object.values(data).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          // Use the first array found
          possibleArrays[0].forEach((forecast, index) => {
            const hourOffset = index * 6;
            formattedData[`${hourOffset}h`] = forecast;
          });
        } else {
          // Last resort: just use the first entry
          formattedData['0h'] = data;
        }
      }
    }
    
    console.log('Formatted weather data:', formattedData);
    return formattedData;
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
