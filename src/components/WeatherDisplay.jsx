import React from 'react';

const WeatherDisplay = ({ weatherData, useMetric = false, onToggleUnits }) => {
  if (!weatherData || typeof weatherData !== 'object') return null;
  
  return (
    <div style={{ margin: '15px 0', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ marginTop: '0', marginBottom: '0', color: '#333' }}>Weather &amp; Hair Forecast</h3>
        <button 
          onClick={onToggleUnits}
          style={{
            padding: '5px 10px',
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
        {weatherData.temperature_f !== undefined && (
          <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Temperature</p>
            <p style={{ fontSize: '1.2em', margin: '0', color: '#333' }}>
              {useMetric ? `${weatherData.temperature_c}°C` : `${weatherData.temperature_f}°F`}
            </p>
          </div>
        )}
        {weatherData.dewpoint_f !== undefined && (
          <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Dewpoint</p>
            <p style={{ fontSize: '1.2em', margin: '0', color: '#333' }}>
              {useMetric ? `${weatherData.dewpoint_c}°C` : `${weatherData.dewpoint_f}°F`}
            </p>
          </div>
        )}
        {weatherData.wind_mph !== undefined && (
          <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Wind Speed</p>
            <p style={{ fontSize: '1.2em', margin: '0', color: '#333' }}>
              {useMetric ? `${weatherData.wind_kph} km/h` : `${weatherData.wind_mph} mph`}
            </p>
          </div>
        )}
      </div>
      
      {weatherData.hfi !== undefined && (
        <div style={{ 
          marginTop: '15px', 
          padding: '15px', 
          backgroundColor: weatherData.hfi >= 8 ? '#e6f7ff' : weatherData.hfi >= 5 ? '#fff7e6' : '#ffe6e6',
          borderRadius: '4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: `4px solid ${weatherData.hfi >= 8 ? '#1890ff' : weatherData.hfi >= 5 ? '#faad14' : '#f5222d'}`
        }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Hair Forecast Index (HFI)</h4>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ 
            fontSize: '2em', 
            fontWeight: 'bold',
            color: weatherData.hfi >= 8 ? '#1890ff' : weatherData.hfi >= 5 ? '#faad14' : '#f5222d'
          }}>
            {weatherData.hfi}
          </span>
          <span style={{ 
            padding: '5px 10px', 
            borderRadius: '15px',
            backgroundColor: weatherData.hfi >= 8 ? '#e6f7ff' : weatherData.hfi >= 5 ? '#fff7e6' : '#ffe6e6',
            color: weatherData.hfi >= 8 ? '#1890ff' : weatherData.hfi >= 5 ? '#faad14' : '#f5222d',
            fontWeight: 'bold',
            border: `1px solid ${weatherData.hfi >= 8 ? '#91d5ff' : weatherData.hfi >= 5 ? '#ffd591' : '#ffa39e'}`
          }}>
            {weatherData.hfi >= 8 ? 'Great Hair Day' : weatherData.hfi >= 5 ? 'Moderate Hair Day' : 'Bad Hair Day'}
          </span>
        </div>
        <p style={{ marginTop: '10px', color: '#666' }}>
          {weatherData.hfi >= 8 
            ? 'Perfect conditions for your hair! Low humidity and gentle winds mean your style should stay in place all day.'
            : weatherData.hfi >= 5 
              ? 'Some frizz possible. Consider using anti-frizz products today.'
              : 'High frizz alert! Consider wearing your hair up or using strong hold products today.'}
        </p>
        </div>
      )}
    </div>
  );
};

export default WeatherDisplay;
