import React from 'react';

const WeatherStatus = ({ 
  wxApiLoading, 
  wxApiError, 
  geohash, 
  hfiLoading, 
  hfiError 
}) => {
  return (
    <>
      {wxApiLoading && <p>Fetching weather data...</p>}
      
      {wxApiError && (
        <div className="error" style={{ color: 'red', margin: '10px 0' }}>
          {wxApiError}
        </div>
      )}
      
      
      {hfiLoading && <p>Fetching Hair Forecast Index data...</p>}
      
      {hfiError && (
        <div className="error" style={{ color: 'red', margin: '10px 0' }}>
          {hfiError}
        </div>
      )}
    </>
  );
};

export default WeatherStatus;
