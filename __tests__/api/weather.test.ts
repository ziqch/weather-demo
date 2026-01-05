import { describe, it, expect } from 'vitest';

// Type definitions based on design document
interface Weather {
  time: string;
  temperature: number;
  temperature_min: number;
  temperature_max: number;
  condition: string;
  uv_index: number;
}

interface WeatherResponse {
  location: string;
  timezone: string;
  current: Weather;
  hourly: Weather[];
  daily: Weather[];
}

describe('Weather API', () => {
  const API_URL = '/api/weather';
  // Test city names
  const TEST_CITY = 'San Francisco';
  const TEST_CITY_ALT = 'London';

  describe('GET /api/weather', () => {
    it('should return 400 if location parameter is missing', async () => {
      const response = await fetch(`http://localhost:3000${API_URL}`);
      expect(response.status).toBe(400);
    });

    it('should return 404 if location is not found', async () => {
      const response = await fetch(`http://localhost:3000${API_URL}?location=InvalidCityNameThatDoesNotExist123`);
      expect(response.status).toBe(404);
    });

    it('should return weather data with valid city name', async () => {
      const response = await fetch(`http://localhost:3000${API_URL}?location=${encodeURIComponent(TEST_CITY)}`);
      const data: WeatherResponse = await response.json();

      expect(response.status).toBe(200);
      expect(data).toBeDefined();
      expect(data.location).toBeDefined();
      expect(typeof data.location).toBe('string');
    });

    it('should return data with correct WeatherResponse structure', async () => {
      const response = await fetch(`http://localhost:3000${API_URL}?location=${encodeURIComponent(TEST_CITY)}`);
      const data: WeatherResponse = await response.json();

      // Validate top-level structure
      expect(data).toHaveProperty('location');
      expect(data).toHaveProperty('timezone');
      expect(data).toHaveProperty('current');
      expect(data).toHaveProperty('hourly');
      expect(data).toHaveProperty('daily');
    });

    it('should return valid timezone information', async () => {
      const response = await fetch(`http://localhost:3000${API_URL}?location=${encodeURIComponent(TEST_CITY)}`);
      const data: WeatherResponse = await response.json();

      expect(data.timezone).toBeDefined();
      expect(typeof data.timezone).toBe('string');
      expect(data.timezone.length).toBeGreaterThan(0);
    });

    it('should validate current weather structure', async () => {
      const response = await fetch(`http://localhost:3000${API_URL}?location=${encodeURIComponent(TEST_CITY)}`);
      const data: WeatherResponse = await response.json();

      const { current } = data;
      expect(current).toHaveProperty('time');
      expect(current).toHaveProperty('temperature');
      expect(current).toHaveProperty('temperature_min');
      expect(current).toHaveProperty('temperature_max');
      expect(current).toHaveProperty('condition');
      expect(current).toHaveProperty('uv_index');

      // Type validation
      expect(typeof current.time).toBe('string');
      expect(typeof current.temperature).toBe('number');
      expect(typeof current.temperature_min).toBe('number');
      expect(typeof current.temperature_max).toBe('number');
      expect(typeof current.condition).toBe('string');
      expect(typeof current.uv_index).toBe('number');
    });

    it('should return exactly 24 hourly weather entries', async () => {
      const response = await fetch(`http://localhost:3000${API_URL}?location=${encodeURIComponent(TEST_CITY)}`);
      const data: WeatherResponse = await response.json();

      expect(Array.isArray(data.hourly)).toBe(true);
      expect(data.hourly.length).toBe(24);
    });

    it('should validate hourly weather structure', async () => {
      const response = await fetch(`http://localhost:3000${API_URL}?location=${encodeURIComponent(TEST_CITY)}`);
      const data: WeatherResponse = await response.json();

      data.hourly.forEach((weather, index) => {
        expect(weather).toHaveProperty('time');
        expect(weather).toHaveProperty('temperature');
        expect(weather).toHaveProperty('temperature_min');
        expect(weather).toHaveProperty('temperature_max');
        expect(weather).toHaveProperty('condition');
        expect(weather).toHaveProperty('uv_index');

        // Type validation
        expect(typeof weather.time).toBe('string');
        expect(typeof weather.temperature).toBe('number');
        expect(typeof weather.temperature_min).toBe('number');
        expect(typeof weather.temperature_max).toBe('number');
        expect(typeof weather.condition).toBe('string');
        expect(typeof weather.uv_index).toBe('number');
      });
    });

    it('should return exactly 7 daily weather entries', async () => {
      const response = await fetch(`http://localhost:3000${API_URL}?location=${encodeURIComponent(TEST_CITY)}`);
      const data: WeatherResponse = await response.json();

      expect(Array.isArray(data.daily)).toBe(true);
      expect(data.daily.length).toBe(7);
    });

    it('should validate daily weather structure', async () => {
      const response = await fetch(`http://localhost:3000${API_URL}?location=${encodeURIComponent(TEST_CITY)}`);
      const data: WeatherResponse = await response.json();

      data.daily.forEach((weather, index) => {
        expect(weather).toHaveProperty('time');
        expect(weather).toHaveProperty('temperature');
        expect(weather).toHaveProperty('temperature_min');
        expect(weather).toHaveProperty('temperature_max');
        expect(weather).toHaveProperty('condition');
        expect(weather).toHaveProperty('uv_index');

        // Type validation
        expect(typeof weather.time).toBe('string');
        expect(typeof weather.temperature).toBe('number');
        expect(typeof weather.temperature_min).toBe('number');
        expect(typeof weather.temperature_max).toBe('number');
        expect(typeof weather.condition).toBe('string');
        expect(typeof weather.uv_index).toBe('number');
      });
    });

    it('should have reasonable temperature values', async () => {
      const response = await fetch(`http://localhost:3000${API_URL}?location=${encodeURIComponent(TEST_CITY)}`);
      const data: WeatherResponse = await response.json();

      // Check current temperature is in reasonable range (-50 to 60 for broader range)
      expect(data.current.temperature).toBeGreaterThanOrEqual(-50);
      expect(data.current.temperature).toBeLessThanOrEqual(60);

      // Check all hourly temperatures
      data.hourly.forEach((weather) => {
        expect(weather.temperature).toBeGreaterThanOrEqual(-50);
        expect(weather.temperature).toBeLessThanOrEqual(60);
      });

      // Check all daily temperatures
      data.daily.forEach((weather) => {
        expect(weather.temperature).toBeGreaterThanOrEqual(-50);
        expect(weather.temperature).toBeLessThanOrEqual(60);
      });
    });

    it('should have temperature_min <= temperature_max', async () => {
      const response = await fetch(`http://localhost:3000${API_URL}?location=${encodeURIComponent(TEST_CITY)}`);
      const data: WeatherResponse = await response.json();

      // Check current
      expect(data.current.temperature_min).toBeLessThanOrEqual(data.current.temperature_max);

      // Check daily (hourly min/max are same, so skipping)
      data.daily.forEach((weather) => {
        expect(weather.temperature_min).toBeLessThanOrEqual(weather.temperature_max);
      });
    });

    it('should have valid UV index values (0-11+)', async () => {
      const response = await fetch(`http://localhost:3000${API_URL}?location=${encodeURIComponent(TEST_CITY)}`);
      const data: WeatherResponse = await response.json();

      // Check current - UV index can go above 11 in extreme cases, but should be >= 0
      expect(data.current.uv_index).toBeGreaterThanOrEqual(0);

      // Check daily
      data.daily.forEach((weather) => {
        expect(weather.uv_index).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have valid weather conditions', async () => {
      const response = await fetch(`http://localhost:3000${API_URL}?location=${encodeURIComponent(TEST_CITY)}`);
      const data: WeatherResponse = await response.json();

      // Check that conditions are non-empty strings
      expect(data.current.condition.length).toBeGreaterThan(0);

      data.hourly.forEach((weather) => {
        expect(weather.condition.length).toBeGreaterThan(0);
      });

      data.daily.forEach((weather) => {
        expect(weather.condition.length).toBeGreaterThan(0);
      });
    });

    it('should have valid time formats', async () => {
      const response = await fetch(`http://localhost:3000${API_URL}?location=${encodeURIComponent(TEST_CITY)}`);
      const data: WeatherResponse = await response.json();

      // Check that times are valid date strings or timestamps
      expect(data.current.time.length).toBeGreaterThan(0);
      expect(new Date(data.current.time).toString()).not.toBe('Invalid Date');

      data.hourly.forEach((weather) => {
        expect(weather.time.length).toBeGreaterThan(0);
        expect(new Date(weather.time).toString()).not.toBe('Invalid Date');
      });

      data.daily.forEach((weather) => {
        expect(weather.time.length).toBeGreaterThan(0);
        expect(new Date(weather.time).toString()).not.toBe('Invalid Date');
      });
    });
  });
});
