# Test Types and Interfaces

This file defines TypeScript types used across the test suite.

## Weather Data Types

```typescript
interface Weather {
  time: string;           // ISO 8601 date string
  temperature: number;    // Temperature in Celsius
  temperature_min: number; // Minimum temperature
  temperature_max: number; // Maximum temperature
  condition: string;      // Weather condition (e.g., "Sunny", "Cloudy")
  uv_index: number;       // UV index (0-11)
}

interface WeatherResponse {
  location: string;       // Location name (e.g., "Seattle")
  current: Weather;       // Current weather data
  hourly: Weather[];      // Array of 24 hourly forecasts
  daily: Weather[];       // Array of 7 daily forecasts
}
```

## Test Constants

### Valid Weather Conditions
```typescript
const VALID_CONDITIONS = [
  'Sunny',
  'Cloudy', 
  'Rain',
  'Snow',
  'Partly Cloudy',
  'Overcast',
  'Thunderstorm',
  'Fog'
];
```

### Temperature Range
```typescript
const TEMPERATURE = {
  MIN: -10,  // Minimum valid temperature in Celsius
  MAX: 40    // Maximum valid temperature in Celsius
};
```

### UV Index Range
```typescript
const UV_INDEX = {
  MIN: 0,   // Minimum UV index
  MAX: 11   // Maximum UV index
};
```

### Forecast Counts
```typescript
const FORECAST = {
  HOURLY_COUNT: 24,  // Number of hourly forecast entries
  DAILY_COUNT: 7     // Number of daily forecast entries
};
```

## Usage in Tests

Import these types in your test files:

```typescript
// API Tests
interface WeatherResponse {
  location: string;
  current: Weather;
  hourly: Weather[];
  daily: Weather[];
}

// Component Tests
const mockWeatherData: WeatherResponse = {
  location: 'Seattle',
  current: { /* ... */ },
  hourly: [ /* 24 items */ ],
  daily: [ /* 7 items */ ]
};
```
