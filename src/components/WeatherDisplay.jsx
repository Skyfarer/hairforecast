import React, { useState } from 'react';

const WeatherDisplay = ({ 
  weatherData, 
  summaryData, 
  useMetric = false, 
  onToggleUnits,
  showDetailView = false,
  onToggleView,
  cityData,
  cityLoading,
  cityError
}) => {
  const [selectedInterval, setSelectedInterval] = useState('0h');
  
  console.log('WeatherDisplay received data:', { weatherData, summaryData });
  
  // If we're in detail view but don't have detailed data
  if (showDetailView && (!weatherData || typeof weatherData !== 'object')) {
    console.log('No detailed weather data available for detail view');
    return <div>Loading detailed forecast data...</div>;
  }
  
  // If we're in summary view but don't have summary data
  if (!showDetailView && (!summaryData || typeof summaryData !== 'object')) {
    console.log('No summary data available');
    return <div>Loading weather summary...</div>;
  }
  
  // For detail view: get available intervals and current data
  let intervals = [];
  let currentData = null;
  let validInterval = null;
  
  if (showDetailView && weatherData) {
    intervals = Object.keys(weatherData);
    console.log('Available intervals:', intervals);
    
    if (intervals.length === 0) {
      console.log('No intervals found in weather data');
      return <div>No forecast intervals available</div>;
    }
    
    // Make sure selectedInterval exists in the data, otherwise use the first available
    validInterval = intervals.includes(selectedInterval) ? selectedInterval : intervals[0];
    if (validInterval !== selectedInterval) {
      setSelectedInterval(validInterval);
    }
    
    // Get data for the selected interval
    currentData = weatherData[validInterval];
    console.log('Current interval data:', validInterval, currentData);
    
    if (!currentData) {
      console.log('No data for selected interval:', validInterval);
      return <div>No data available for the selected time period</div>;
    }
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
    if (hfi >= 8) return 'Great Hair Conditions';
    if (hfi >= 5) return 'Moderate Hair Conditions';
    return 'Bad Hair Conditions';
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
  const sortedIntervals = intervals.length > 0 ? [...intervals].sort((a, b) => {
    return parseInt(a.replace('h', '')) - parseInt(b.replace('h', ''));
  }) : [];

  // Get first 8 intervals or all if less than 8
  const displayIntervals = sortedIntervals.slice(0, 8);
  
  console.log('Display intervals:', displayIntervals);
  if (displayIntervals.length > 0 && weatherData) {
    console.log('Sample data for first interval:', weatherData[displayIntervals[0]]);
  }

  // Convert temperature based on units
  const convertTemperature = (tempF) => {
    if (tempF === undefined) return 'N/A';
    return useMetric 
      ? `${Math.round((tempF - 32) * 5/9)}°C`
      : `${Math.round(tempF)}°F`;
  };
  
  // Convert wind speed based on units
  const convertWindSpeed = (windMph) => {
    if (windMph === undefined) return 'N/A';
    return useMetric 
      ? `${Math.round(windMph * 1.60934)} km/h`
      : `${windMph} mph`;
  };
  
  // Detect dark mode using CSS media query
  const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Define color schemes for light and dark modes
  const colors = {
    background: prefersDarkMode ? '#2a2a2a' : '#f5f5f5',
    cardBackground: prefersDarkMode ? '#333' : 'white',
    headerBackground: prefersDarkMode ? '#222' : '#f0f0f0',
    text: prefersDarkMode ? '#e0e0e0' : '#333',
    border: prefersDarkMode ? '#444' : '#ddd',
    shadow: prefersDarkMode ? '0 2px 4px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
  };
  
  // Adjust HFI colors for dark mode
  const getHfiColorAdjusted = (hfi) => {
    const baseColors = getHfiColor(hfi);
    
    if (prefersDarkMode) {
      // Darker versions of the colors for dark mode
      if (hfi >= 8) return { bg: '#0a3049', border: '#1890ff', text: '#61dafb' }; // Blue
      if (hfi >= 5) return { bg: '#3e2e00', border: '#faad14', text: '#ffd666' }; // Yellow/Orange
      return { bg: '#3b0000', border: '#f5222d', text: '#ff7875' }; // Red
    }
    
    return baseColors;
  };

  // Render the summary view
  const renderSummaryView = () => {
    if (!summaryData) return null;
    
    const { average_hfi, average_wind_mph, high_temperature_f, intervals_analyzed } = summaryData;
    const hfiColors = getHfiColorAdjusted(average_hfi);
    
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: colors.cardBackground, 
        borderRadius: '8px',
        boxShadow: colors.shadow,
        marginBottom: '20px'
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <div style={{ 
            fontSize: '3em', 
            fontWeight: 'bold',
            color: hfiColors.text,
            margin: '10px 0'
          }}>
            {Math.round(average_hfi)}
          </div>
          <div style={{ 
            padding: '8px 16px', 
            backgroundColor: hfiColors.bg,
            color: hfiColors.text,
            borderRadius: '20px',
            fontWeight: 'bold',
            border: `1px solid ${hfiColors.border}`,
            marginBottom: '10px'
          }}>
            {getHfiStatus(average_hfi)}
          </div>
          <p style={{ 
            color: colors.text,
            margin: '10px 0',
            fontSize: '0.9em'
          }}>
            {getHfiDescription(average_hfi)}
          </p>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          marginTop: '20px',
          borderTop: `1px solid ${colors.border}`,
          paddingTop: '20px'
        }}>
          <div style={{ textAlign: 'center', margin: '0 10px' }}>
            <div style={{ fontSize: '0.9em', color: prefersDarkMode ? '#aaa' : '#666' }}>High Temperature</div>
            <div style={{ fontSize: '1.4em', fontWeight: 'bold', color: colors.text }}>
              {convertTemperature(high_temperature_f)}
            </div>
          </div>
          <div style={{ textAlign: 'center', margin: '0 10px' }}>
            <div style={{ fontSize: '0.9em', color: prefersDarkMode ? '#aaa' : '#666' }}>Average Wind</div>
            <div style={{ fontSize: '1.4em', fontWeight: 'bold', color: colors.text }}>
              {convertWindSpeed(average_wind_mph)}
            </div>
          </div>
          <div style={{ textAlign: 'center', margin: '0 10px' }}>
            <div style={{ fontSize: '0.9em', color: prefersDarkMode ? '#aaa' : '#666' }}>Forecast Period</div>
            <div style={{ fontSize: '1.4em', fontWeight: 'bold', color: colors.text }}>
              {intervals_analyzed * 6} hours
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Format city name for display
  const formatCityName = () => {
    if (!cityData) return null;
    
    let cityName = cityData.name;
    if (cityData.state_code) {
      cityName += `, ${cityData.state_code}`;
    }
    return cityName;
  };

  return (
    <div style={{ margin: '15px 0', padding: '15px', backgroundColor: colors.background, borderRadius: '5px', boxShadow: colors.shadow }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div>
          <h3 style={{ marginTop: '0', marginBottom: '0', color: colors.text, marginRight: '15px' }}>Weather &amp; Hair Forecast</h3>
          {cityData && (
            <div style={{ 
              color: prefersDarkMode ? '#aaa' : '#666', 
              fontSize: '0.9em',
              marginTop: '5px'
            }}>
              {formatCityName()}
            </div>
          )}
          {cityLoading && (
            <div style={{ 
              color: prefersDarkMode ? '#aaa' : '#666', 
              fontSize: '0.9em',
              marginTop: '5px'
            }}>
              Loading location...
            </div>
          )}
          {cityError && (
            <div style={{ 
              color: 'red', 
              fontSize: '0.9em',
              marginTop: '5px'
            }}>
              {cityError}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={onToggleView}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4361ee',
              color: 'white',
              border: '1px solid #4361ee',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9em',
              fontWeight: 'bold'
            }}
          >
            {showDetailView ? 'Show Summary' : 'Show Details'}
          </button>
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
      </div>
      
      {!showDetailView ? renderSummaryView() : (
        <>
          {/* Forecast table */}
          <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: colors.cardBackground, borderRadius: '4px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ backgroundColor: colors.headerBackground }}>
              <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: `1px solid ${colors.border}`, color: colors.text }}>Time</th>
              <th style={{ padding: '12px 15px', textAlign: 'center', borderBottom: `1px solid ${colors.border}`, color: colors.text }}>Temperature</th>
              <th style={{ padding: '12px 15px', textAlign: 'center', borderBottom: `1px solid ${colors.border}`, color: colors.text }}>Wind Speed</th>
              <th style={{ padding: '12px 15px', textAlign: 'center', borderBottom: `1px solid ${colors.border}`, color: colors.text }}>HFI</th>
              <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: `1px solid ${colors.border}`, color: colors.text }}>Hair Day Quality</th>
            </tr>
          </thead>
          <tbody>
            {weatherData && displayIntervals.map(interval => {
              const data = weatherData[interval];
              if (!data) return null;
              
              // Check if HFI is directly in the data object or in a nested object
              const hfi = data.hfi !== undefined ? data.hfi : 
                         (data.hair_forecast_index !== undefined ? data.hair_forecast_index : null);
              const hfiColors = hfi !== null ? getHfiColorAdjusted(hfi) : { bg: prefersDarkMode ? '#2a2a2a' : '#f9f9f9', text: prefersDarkMode ? '#aaa' : '#666', border: colors.border };
              
              return (
                <tr key={interval} 
                    style={{ 
                      backgroundColor: interval === selectedInterval ? hfiColors.bg : colors.cardBackground,
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedInterval(interval)}>
                  <td style={{ padding: '12px 15px', borderBottom: `1px solid ${colors.border}`, fontWeight: interval === selectedInterval ? 'bold' : 'normal', color: colors.text }}>
                    {formatInterval(interval.replace('h', ''))}
                  </td>
                  <td style={{ padding: '12px 15px', textAlign: 'center', borderBottom: `1px solid ${colors.border}`, color: colors.text }}>
                    {getTemperature(data)}
                  </td>
                  <td style={{ padding: '12px 15px', textAlign: 'center', borderBottom: `1px solid ${colors.border}`, color: colors.text }}>
                    {getWindSpeed(data)}
                  </td>
                  <td style={{ 
                    padding: '12px 15px', 
                    textAlign: 'center', 
                    borderBottom: `1px solid ${colors.border}`,
                    fontWeight: 'bold',
                    color: hfi !== null ? hfiColors.text : (prefersDarkMode ? '#aaa' : '#666')
                  }}>
                    {hfi !== null ? Math.round(hfi) : 'N/A'}
                  </td>
                  <td style={{ padding: '12px 15px', borderBottom: `1px solid ${colors.border}`, color: colors.text }}>
                    {hfi !== null ? (
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '12px',
                        backgroundColor: hfiColors.bg,
                        color: hfiColors.text,
                        fontWeight: 'bold',
                        border: `1px solid ${hfiColors.border}`,
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
          {currentData && validInterval && (currentData.hfi !== undefined || currentData.hair_forecast_index !== undefined) && (
            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              backgroundColor: getHfiColorAdjusted(currentData.hfi).bg,
              borderRadius: '4px',
              boxShadow: prefersDarkMode ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
              borderLeft: `4px solid ${getHfiColorAdjusted(currentData.hfi).border}`
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: getHfiColorAdjusted(currentData.hfi).text }}>
                Hair Forecast Details - {formatInterval(validInterval.replace('h', ''))}
              </h4>
              <p style={{ color: prefersDarkMode ? '#bbb' : '#666', margin: '10px 0' }}>
                {getHfiDescription(currentData.hfi !== undefined ? currentData.hfi : currentData.hair_forecast_index)}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WeatherDisplay;
