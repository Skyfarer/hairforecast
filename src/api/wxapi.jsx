// API functions for weather data

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
