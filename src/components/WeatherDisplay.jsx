import React, { useState } from 'react';

const WeatherDisplay = ({ weatherData, useMetric = false, onToggleUnits }) => {
  const [selectedInterval, setSelectedInterval] = useState('0h');
  
  if (!weatherData || typeof weatherData !== 'object') return null;
  
  // Get available intervals
  const intervals = Object.keys(weatherData);
  if (intervals.length === 0) return null;
  
  // Get data for the selected interval
  const currentData = weatherData[selectedInterval];
  if (!currentData) return null;
  
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
  
  return (
    <div style={{ margin: '15px 0', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
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
      
      {/* Interval selector */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '15px',
        overflowX: 'auto',
        padding: '5px 0'
      }}>
        {intervals.map(interval => {
          const intervalHours = interval.replace('h', '');
          const isSelected = interval === selectedInterval;
          const hfi = weatherData[interval].hfi;
          const colors = getHfiColor(hfi);
          
          return (
            <button
              key={interval}
              onClick={() => setSelectedInterval(interval)}
              style={{
                flex: '1',
                margin: '0 5px',
                padding: '10px',
                backgroundColor: isSelected ? colors.bg : 'white',
                color: isSelected ? colors.text : '#333',
                border: isSelected ? `1px solid ${colors.border}` : '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: isSelected ? 'bold' : 'normal',
                minWidth: '80px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ marginBottom: '5px' }}>{formatInterval(intervalHours)}</div>
              {hfi !== undefined && (
                <div style={{ 
                  fontSize: '1.2em', 
                  fontWeight: 'bold',
                  color: colors.text
                }}>
                  HFI: {hfi}
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Weather data for selected interval */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
        {currentData.temperature_f !== undefined && (
          <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Temperature</p>
            <p style={{ fontSize: '1.2em', margin: '0', color: '#333' }}>
              {useMetric 
                ? (currentData.temperature_c !== undefined ? `${currentData.temperature_c}°C` : `${Math.round((currentData.temperature_f - 32) * 5/9)}°C`) 
                : `${currentData.temperature_f}°F`}
            </p>
          </div>
        )}
        {currentData.dewpoint_f !== undefined && (
          <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Dewpoint</p>
            <p style={{ fontSize: '1.2em', margin: '0', color: '#333' }}>
              {useMetric 
                ? (currentData.dewpoint_c !== undefined ? `${currentData.dewpoint_c}°C` : `${Math.round((currentData.dewpoint_f - 32) * 5/9)}°C`) 
                : `${currentData.dewpoint_f}°F`}
            </p>
          </div>
        )}
        {currentData.wind_mph !== undefined && (
          <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Wind Speed</p>
            <p style={{ fontSize: '1.2em', margin: '0', color: '#333' }}>
              {useMetric 
                ? (currentData.wind_kph !== undefined ? `${currentData.wind_kph} km/h` : `${Math.round(currentData.wind_mph * 1.60934)} km/h`) 
                : `${currentData.wind_mph} mph`}
            </p>
          </div>
        )}
      </div>
      
      {/* HFI display for selected interval */}
      {currentData.hfi !== undefined && (
        <div style={{ 
          marginTop: '15px', 
          padding: '15px', 
          backgroundColor: getHfiColor(currentData.hfi).bg,
          borderRadius: '4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: `4px solid ${getHfiColor(currentData.hfi).border}`
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
            Hair Forecast Index (HFI) - {formatInterval(selectedInterval.replace('h', ''))}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ 
              fontSize: '2em', 
              fontWeight: 'bold',
              color: getHfiColor(currentData.hfi).text
            }}>
              {currentData.hfi}
            </span>
            <span style={{ 
              padding: '5px 10px', 
              borderRadius: '15px',
              backgroundColor: getHfiColor(currentData.hfi).bg,
              color: getHfiColor(currentData.hfi).text,
              fontWeight: 'bold',
              border: `1px solid ${getHfiColor(currentData.hfi).border}`
            }}>
              {getHfiStatus(currentData.hfi)}
            </span>
          </div>
          <p style={{ marginTop: '10px', color: '#666' }}>
            {getHfiDescription(currentData.hfi)}
          </p>
        </div>
      )}
    </div>
  );
};

export default WeatherDisplay;
