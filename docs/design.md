# Weather Application Design Document

## Project Overview

You are building a **Weather Demo** tool that provides:

- **Current weather**
- **Hourly forecast** for today
- **7-day forecast**

**Tech Stack:**

- Backend: Next.js API
- Frontend: Next.js (React)
- Testing: Jest / Vitest

## Data Structure

```ts
interface WeatherResponse {
  location: string;
  timezone: string;
  current: Weather;
  hourly: Weather[];
  daily: Weather[];
}

interface Weather {
  time: string;
  temperature: number;
  temperature_min: number;
  temperature_max: number;
  condition: string;
  uv_index: number;
}
```

## Agent Tasks

### Backend Agent - Backend API

- **Endpoint:** `GET /api/weather`

- **Query Parameters:**
  - `location` (required) - City name (e.g., "San Francisco", "London", "Tokyo")

- **Responsibilities:**
  - Use [**Open-Meteo Geocoding API**](https://open-meteo.com/en/docs/geocoding-api) to convert city name to latitude and longitude coordinates.
  - Query weather data from [**Open-Meteo Weather API**](https://open-meteo.com/en/docs) using the obtained coordinates.
  - Use `timezone=auto` parameter to automatically get the location's timezone from Open-Meteo.
  - Convert the Open-Meteo response into the `WeatherResponse` format as defined above.
  - Return 404 error if the city name is not found.

### Frontend Agent - Frontend Rendering

- **Route Requirement:**
  - The page should be accessed using:
    ```
    /weather?location=CityName
    ```
  - If no `location` parameter is provided, default to **San Francisco**.
  - The frontend should **read `location` from the query string** and pass it to `/api/weather`.

- **Responsibilities:**
  - Read the `location` query parameter from the URL.
  - If no location parameter exists, use "San Francisco" as the default.
  - Fetch weather data from the backend using the location parameter.
  - Use the timezone information from the API response to display times correctly in the location's local time.
  - Render current weather, hourly forecast, and 7-day forecast sections.

- **UI / UX Requirements**
  - Layout should be **clean, modern, and visually appealing**
  - The page has three sections:
      - Current Weather  
          - Show: city, current temp, min/max temp, condition, UV index
      - Hourly Forecast  
          - Horizontal list
          - Each item: time, condition, temperature
      - 7-Day Forecast  
          - Vertical list
          - Each item: date, condition, temperature range
          - Show the range with a bar

  - Suggested styling goals:
      - Clear section titles
      - Cards or panels to group information
      - Consistent spacing & alignment
      - Responsive layout (desktop & mobile look good)
      - You may use Tailwind

### Test Agent - Testing

- **Responsibilities:**
  - Validate **backend API response**:
    - Structure matches `WeatherResponse`
    - All required fields are present
    - Types are correct
  - Test **frontend rendering**:
    - Current weather section renders correctly
    - Hourly list renders 24 rows
    - Daily list renders 7 items
    - Location name is displayed