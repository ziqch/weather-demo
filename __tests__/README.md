# Weather App Testing Suite

This directory contains comprehensive tests for the Weather Demo application, covering both backend API and frontend components.

## Test Structure

```
__tests__/
├── api/
│   └── weather.test.ts          # Backend API tests
└── components/
    └── WeatherPage.test.tsx     # Frontend component tests
```

## Test Framework

- **Framework**: Vitest
- **Testing Library**: @testing-library/react
- **Assertion Library**: @testing-library/jest-dom

## Running Tests

### Run all tests once
```bash
npm test
```

### Run tests in watch mode (for development)
```bash
npm run test:watch
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests with coverage report
```bash
npm run test:coverage
```

## Backend API Tests (`__tests__/api/weather.test.ts`)

### Test Coverage

#### 1. **Basic API Functionality**
- ✅ Returns weather data with default location
- ✅ Returns weather data with custom location parameter
- ✅ Returns correct WeatherResponse structure

#### 2. **Data Structure Validation**
- ✅ Validates current weather has all required fields
- ✅ Validates hourly array has all required fields
- ✅ Validates daily array has all required fields
- ✅ Verifies correct data types for all fields

#### 3. **Random Generation Logic**
- ✅ Returns exactly 24 hourly weather entries
- ✅ Returns exactly 7 daily weather entries
- ✅ Each entry has valid structure

#### 4. **Data Quality Checks**
- ✅ Temperature values are within reasonable range (-10°C to 40°C)
- ✅ temperature_min ≤ temperature_max for all entries
- ✅ UV index is within valid range (0-11)
- ✅ Weather conditions are non-empty strings
- ✅ Time values are valid date strings

#### 5. **Type Validation**
All fields are validated for correct TypeScript types:
```typescript
interface Weather {
  time: string;           // ISO date string
  temperature: number;    // Current/average temperature
  temperature_min: number; // Minimum temperature
  temperature_max: number; // Maximum temperature
  condition: string;      // Weather condition
  uv_index: number;       // UV index (0-11)
}

interface WeatherResponse {
  location: string;       // Location name
  current: Weather;       // Current weather
  hourly: Weather[];      // 24 hourly entries
  daily: Weather[];       // 7 daily entries
}
```

## Frontend Component Tests (`__tests__/components/WeatherPage.test.tsx`)

### Test Coverage

#### 1. **Location Parameter Handling**
- ✅ Reads location from URL query parameter
- ✅ Passes location to API fetch request

#### 2. **Current Weather Section**
- ✅ Renders all required fields:
  - City name
  - Current temperature
  - Min/max temperature range
  - Weather condition
  - UV index
- ✅ Data types are correct
- ✅ Temperature range is logical (min ≤ max)

#### 3. **Hourly Forecast Section**
- ✅ Renders exactly 24 hourly items
- ✅ Each item displays:
  - Time
  - Condition
  - Temperature
- ✅ Data structure supports horizontal list layout

#### 4. **7-Day Forecast Section**
- ✅ Renders exactly 7 daily items
- ✅ Each item displays:
  - Date
  - Condition
  - Temperature range (min/max)
- ✅ Data structure supports vertical list layout
- ✅ Temperature data is suitable for range bar visualization

#### 5. **Data Fetching**
- ✅ Fetches data from API on component mount
- ✅ Includes location parameter in API call
- ✅ Handles API response correctly
- ✅ Handles API errors gracefully

#### 6. **UI/UX Structure**
- ✅ Three distinct sections (current, hourly, daily)
- ✅ Horizontal layout support for hourly forecast
- ✅ Vertical layout support for daily forecast
- ✅ Temperature range bar data validation

## Running Tests for Development

### Prerequisites
1. Ensure the backend API is implemented at `/api/weather`
2. Ensure the weather page component is implemented at `/weather`
3. Start the development server: `npm run dev`

### For API Tests
API tests make actual HTTP requests to `http://localhost:3000/api/weather`. The development server must be running.

### For Component Tests
Component tests use mocked data and don't require the server to be running. They validate:
- Component structure
- Data flow
- Rendering logic
- User interactions

## Test Data

### Mock Weather Data Structure
The frontend tests use comprehensive mock data:
- **Location**: "Seattle"
- **Current Weather**: Single Weather object
- **Hourly Forecast**: Array of 24 Weather objects
- **Daily Forecast**: Array of 7 Weather objects

### Data Validation Rules
1. **Temperature**: -10°C to 40°C
2. **UV Index**: 0 to 11
3. **Conditions**: Non-empty strings (e.g., "Sunny", "Cloudy", "Rain", "Snow")
4. **Time**: Valid ISO date strings
5. **Temperature Range**: min ≤ max

## Extending the Tests

### Adding New API Tests
```typescript
it('should test new functionality', async () => {
  const response = await fetch('http://localhost:3000/api/weather?location=Seattle');
  const data = await response.json();
  
  // Add your assertions
  expect(data).toBeDefined();
});
```

### Adding New Component Tests
```typescript
it('should test new UI behavior', () => {
  // Setup mock data
  const mockData = { /* ... */ };
  
  // Mock fetch
  global.fetch = vi.fn(() => 
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as Response)
  );
  
  // Add your test logic
});
```

## Continuous Integration

These tests are designed to be run in CI/CD pipelines. Ensure:
1. Node.js environment is set up
2. Dependencies are installed (`npm install`)
3. For API tests, the Next.js server is running
4. Run tests with: `npm test`

## Troubleshooting

### API Tests Failing
- Ensure development server is running on port 3000
- Check that `/api/weather` endpoint is implemented
- Verify the API returns data matching the WeatherResponse interface

### Component Tests Failing
- Check that mock data structure matches actual API response
- Verify component imports are correct
- Ensure React Testing Library is properly configured

### Port Conflicts
If port 3000 is in use:
```bash
PORT=3001 npm run dev
```
Then update test URLs accordingly.

## Design Document Reference

These tests implement all requirements from `docs/design.md`:
- ✅ Backend API response validation
- ✅ Random generation logic validation (24 hourly, 7 daily)
- ✅ Frontend rendering validation (all three sections)
- ✅ Data structure validation (WeatherResponse interface)
- ✅ Type checking for all fields

## Contributing

When adding new features:
1. Update corresponding test files
2. Ensure all existing tests still pass
3. Add new test cases for new functionality
4. Update this README if test structure changes
