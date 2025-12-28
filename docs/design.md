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
  - `location?: string`  
    Example: `/api/weather?location=Seattle`

- **Responsibilities:**
  - Generate **random weather data** according to the `Weather` interface.
  - Returned data must contain:
    - `current`: current random weather
    - `hourly`: **24** randomly generated weather entries (one per hour for today)
    - `daily`: **7** randomly generated weather entries starting from today forward
  - If `location` is not provided, default to a placeholder (e.g., `"Unknown"` or `"San Francisco"`).

- **Random Data Requirements:**
  - `temperature`: reasonable range (e.g., -10°C ~ 40°C)
  - `temperature_min` / `temperature_max` must be consistent
  - `condition`: pick randomly from a preset list (e.g., `"Sunny"`, `"Cloudy"`, `"Rain"`, `"Snow"`)
  - `uv_index`: 0–11
  - `time`:
    - `current`: current timestamp
    - `hourly`: each entry = current day, hour increasing
    - `daily`: each entry = day increasing

---

### Frontend Agent - Frontend Rendering

- **Route Requirement:**
  - The page should be accessed using:
    ```
    /weather?location=CityName
    ```
  - The frontend should **read `location` from the query string** and pass it to `/api/weather`.

- **Responsibilities:**
  - Build a **Next.js page** that fetches weather data from `/api/weather?location=CityName`.
  - Render the following sections:

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
  - Test **random generation logic**:
    - Hourly count === 24
    - Daily count === 7
  - Test **frontend rendering** using mocked data:
    - Current weather section renders correctly
    - Hourly list renders 24 rows
    - Daily list renders 7 items
    - Location name is displayed