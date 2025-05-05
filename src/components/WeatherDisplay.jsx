import React, { useState } from 'react';

const WeatherDisplay = ({ weatherData, useMetric = false, onToggleUnits }) => {
  const [selectedInterval, setSelectedInterval] = useState('0h');
  
  console.log('WeatherDisplay received data:', weatherData);
  
  if (!weatherData || typeof weatherData !== 'object') {
    console.log('No weather data or invalid format');
    return <div>No weather data available</div>;
  }
  
  // Get available intervals
  const intervals = Object.keys(weatherData);
  console.log('Available intervals:', intervals);
  
  if (intervals.length === 0) {
    console.log('No intervals found in weather data');
    return <div>No forecast intervals available</div>;
  }
  
  // Make sure selectedInterval exists in the data, otherwise use the first available
  const validInterval = intervals.includes(selectedInterval) ? selectedInterval : intervals[0];
  if (validInterval !== selectedInterval) {
    setSelectedInterval(validInterval);
  }
  
  // Get data for the selected interval
  const currentData = weatherData[validInterval];
  console.log('Current interval data:', validInterval, currentData);
  
  if (!currentData) {
    console.log('No data for selected interval:', validInterval);
    return <div>No data available for the selected time period</div>;
  }
  
  // Convert interval to readable time format
  const formatInterval = (interval) => {
    const hours = parseInt(interval);
    if (hours === 0) return 'Now';
    if (hours <= 24) return `+${hours} hours`;
    // For intervals beyond 24 hours, show days
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours === 0) return `+${days} day${days > 1 ? 's' : ''}`;
    return `+${days}d ${remainingHours}h`;
  };
  
  // Get background color based on HFI value
  const getHfiColor = (hfi) => {
    if (hfi >= 8) return { bg: '#e6f7ff', border: '#1890ff', text: '#1890ff' };
    if (hfi >= 5) return { bg: '#fff7e6', border: '#faad14', text: '#faad14' };
    return { bg: '#ffe6e6', border: '#f5222d', text: '#f5222d' };
  };
  
  // Get HFI description
  const getHfiDescription = (hfi) => {
    if (hfi >= 8) return 'Perfect conditions for your hair! Low humidity and gentle winds mean your style should stay in place all day.';
    if (hfi >= 5) return 'Some frizz possible. Consider using anti-frizz products today.';
    return 'High frizz alert! Consider wearing your hair up or using strong hold products today.';
  };
  
  // Get HFI status text
  const getHfiStatus = (hfi) => {
    if (hfi >= 8) return 'Great Hair Day';
    if (hfi >= 5) return 'Moderate Hair Day';
    return 'Bad Hair Day';
  };
  
  // Get temperature display value
  const getTemperature = (data) => {
    if (!data) return 'N/A';
    
    // Check if temperature is directly in the data object
    let tempF = data.temperature_f;
    let tempC = data.temperature_c;
    
    // If not, check if it's in a nested 'temperature' object
    if (tempF === undefined && data.temperature && typeof data.temperature === 'object') {
      tempF = data.temperature.f;
      tempC = data.temperature.c;
    }
    
    return useMetric 
      ? (tempC !== undefined 
          ? `${Math.round(tempC)}°C` 
          : tempF !== undefined 
            ? `${Math.round((tempF - 32) * 5/9)}°C`
            : 'N/A') 
      : tempF !== undefined 
        ? `${Math.round(tempF)}°F`
        : 'N/A';
  };

  // Get dewpoint display value
  const getDewpoint = (data) => {
    if (!data) return 'N/A';
    
    // Check if dewpoint is directly in the data object
    let dewpointF = data.dewpoint_f;
    let dewpointC = data.dewpoint_c;
    
    // If not, check if it's in a nested 'dewpoint' object
    if (dewpointF === undefined && data.dewpoint && typeof data.dewpoint === 'object') {
      dewpointF = data.dewpoint.f;
      dewpointC = data.dewpoint.c;
    }
    
    return useMetric 
      ? (dewpointC !== undefined 
          ? `${Math.round(dewpointC)}°C` 
          : dewpointF !== undefined 
            ? `${Math.round((dewpointF - 32) * 5/9)}°C`
            : 'N/A') 
      : dewpointF !== undefined 
        ? `${Math.round(dewpointF)}°F`
        : 'N/A';
  };

  // Get wind speed display value
  const getWindSpeed = (data) => {
    if (!data) return 'N/A';
    
    // Check if wind speed is directly in the data object
    let windMph = data.wind_mph;
    let windKph = data.wind_kph;
    
    // If not, check if it's in a nested 'wind' object
    if (windMph === undefined && data.wind && typeof data.wind === 'object') {
      windMph = data.wind.mph;
      windKph = data.wind.kph;
    }
    
    return useMetric 
      ? (windKph !== undefined 
          ? `${windKph} km/h` 
          : windMph !== undefined 
            ? `${Math.round(windMph * 1.60934)} km/h`
            : 'N/A') 
      : windMph !== undefined 
        ? `${windMph} mph`
        : 'N/A';
  };

  // Sort intervals numerically
  const sortedIntervals = [...intervals].sort((a, b) => {
    return parseInt(a.replace('h', '')) - parseInt(b.replace('h', ''));
  });

  // Get first 8 intervals or all if less than 8
  const displayIntervals = sortedIntervals.slice(0, 8);
  
  console.log('Display intervals:', displayIntervals);
  console.log('Sample data for first interval:', weatherData[displayIntervals[0]]);

  return (
    <div style={{ margin: '15px 0', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ marginTop: '0', marginBottom: '0', color: '#333' }}>Weather &amp; Hair Forecast</h3>
        <button 
          onClick={onToggleUnits}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: '1px solid #4CAF50',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9em',
            fontWeight: 'bold'
          }}
        >
          {useMetric ? 'Switch to °F' : 'Switch to °C'}
        </button>
      </div>
      
      {/* Forecast table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '4px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Time</th>
              <th style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Temperature</th>
              <th style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Wind Speed</th>
              <th style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>HFI</th>
              <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Hair Day Quality</th>
            </tr>
          </thead>
          <tbody>
            {displayIntervals.map(interval => {
              const data = weatherData[interval];
              // Check if HFI is directly in the data object or in a nested object
              const hfi = data.hfi !== undefined ? data.hfi : 
                         (data.hair_forecast_index !== undefined ? data.hair_forecast_index : null);
              const colors = hfi !== null ? getHfiColor(hfi) : { bg: '#f9f9f9', text: '#666', border: '#ddd' };
              
              return (
                <tr key={interval} 
                    style={{ 
                      backgroundColor: interval === selectedInterval ? colors.bg : 'white',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedInterval(interval)}>
                  <td style={{ padding: '12px 15px', borderBottom: '1px solid #ddd', fontWeight: interval === selectedInterval ? 'bold' : 'normal' }}>
                    {formatInterval(interval.replace('h', ''))}
                  </td>
                  <td style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                    {getTemperature(data)}
                  </td>
                  <td style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                    {getWindSpeed(data)}
                  </td>
                  <td style={{ 
                    padding: '12px 15px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #ddd',
                    fontWeight: 'bold',
                    color: hfi !== null ? colors.text : '#666'
                  }}>
                    {hfi !== null ? hfi : 'N/A'}
                  </td>
                  <td style={{ padding: '12px 15px', borderBottom: '1px solid #ddd' }}>
                    {hfi !== null ? (
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '12px',
                        backgroundColor: colors.bg,
                        color: colors.text,
                        fontWeight: 'bold',
                        border: `1px solid ${colors.border}`,
                        fontSize: '0.9em',
                        whiteSpace: 'nowrap'
                      }}>
                        {getHfiStatus(hfi)}
                      </span>
                    ) : 'N/A'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Detailed HFI display for selected interval */}
      {(currentData.hfi !== undefined || currentData.hair_forecast_index !== undefined) && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: getHfiColor(currentData.hfi).bg,
          borderRadius: '4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: `4px solid ${getHfiColor(currentData.hfi).border}`
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
            Hair Forecast Details - {formatInterval(validInterval.replace('h', ''))}
          </h4>
          <p style={{ color: '#666', margin: '10px 0' }}>
            {getHfiDescription(currentData.hfi !== undefined ? currentData.hfi : currentData.hair_forecast_index)}
          </p>
        </div>
      )}
    </div>
  );
};

export default WeatherDisplay;
