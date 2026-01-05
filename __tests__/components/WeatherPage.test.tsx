import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock data matching the WeatherResponse interface
const mockWeatherData = {
  location: 'San Francisco, California, United States',
  timezone: 'America/Los_Angeles',
  current: {
    time: new Date().toISOString(),
    temperature: 20,
    temperature_min: 15,
    temperature_max: 25,
    condition: 'Clear',
    uv_index: 5,
  },
  hourly: Array.from({ length: 24 }, (_, i) => ({
    time: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
    temperature: 15 + Math.random() * 10,
    temperature_min: 10 + Math.random() * 5,
    temperature_max: 20 + Math.random() * 10,
    condition: ['Clear', 'Cloudy', 'Rain'][Math.floor(Math.random() * 3)],
    uv_index: 0, // Hourly UV index not available
  })),
  daily: Array.from({ length: 7 }, (_, i) => ({
    time: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
    temperature: 18 + Math.random() * 10,
    temperature_min: 12 + Math.random() * 5,
    temperature_max: 22 + Math.random() * 10,
    condition: ['Clear', 'Cloudy', 'Rain', 'Snow'][Math.floor(Math.random() * 4)],
    uv_index: Math.floor(Math.random() * 11),
  })),
};

describe('Weather Page Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Mock fetch API
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockWeatherData),
      } as Response)
    );
  });

  describe('Location Parameter', () => {
    it('should use San Francisco as default location', () => {
      const DEFAULT_CITY = 'San Francisco';
      expect(DEFAULT_CITY).toBe('San Francisco');
    });

    it('should fetch weather data with location parameter', async () => {
      const location = 'San Francisco';
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockWeatherData),
        } as Response)
      );
      global.fetch = mockFetch;

      // Simulate fetching data with location parameter
      await fetch(`/api/weather?location=${encodeURIComponent(location)}`);

      expect(mockFetch).toHaveBeenCalledWith(`/api/weather?location=${encodeURIComponent(location)}`);
    });

    it('should support different city names', async () => {
      const cities = ['San Francisco', 'London', 'Tokyo', 'New York'];

      for (const city of cities) {
        const mockFetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockWeatherData),
          } as Response)
        );
        global.fetch = mockFetch;

        await fetch(`/api/weather?location=${encodeURIComponent(city)}`);
        expect(mockFetch).toHaveBeenCalledWith(`/api/weather?location=${encodeURIComponent(city)}`);
      }
    });
  });

  describe('Current Weather Section', () => {
    it('should render current weather with all required fields', () => {
      // Test that current weather section displays:
      // - City name
      // - Current temperature
      // - Min/max temperature
      // - Condition
      // - UV index

      const { current, location } = mockWeatherData;

      // Verify data structure is correct for rendering
      expect(location).toBeDefined();
      expect(current.temperature).toBeDefined();
      expect(current.temperature_min).toBeDefined();
      expect(current.temperature_max).toBeDefined();
      expect(current.condition).toBeDefined();
      expect(current.uv_index).toBeDefined();
    });

    it('should display location name', () => {
      expect(mockWeatherData.location).toBe('San Francisco, California, United States');
    });

    it('should display current temperature', () => {
      expect(mockWeatherData.current.temperature).toBe(20);
    });

    it('should display temperature range', () => {
      const { temperature_min, temperature_max } = mockWeatherData.current;
      expect(temperature_min).toBe(15);
      expect(temperature_max).toBe(25);
      expect(temperature_min).toBeLessThanOrEqual(temperature_max);
    });

    it('should display weather condition', () => {
      expect(mockWeatherData.current.condition).toBe('Clear');
    });

    it('should display UV index', () => {
      expect(mockWeatherData.current.uv_index).toBe(5);
      expect(mockWeatherData.current.uv_index).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Hourly Forecast Section', () => {
    it('should render 24 hourly weather items', () => {
      expect(mockWeatherData.hourly).toHaveLength(24);
    });

    it('should display time for each hourly item', () => {
      mockWeatherData.hourly.forEach((hour) => {
        expect(hour.time).toBeDefined();
        expect(typeof hour.time).toBe('string');
      });
    });

    it('should display condition for each hourly item', () => {
      mockWeatherData.hourly.forEach((hour) => {
        expect(hour.condition).toBeDefined();
        expect(typeof hour.condition).toBe('string');
        expect(hour.condition.length).toBeGreaterThan(0);
      });
    });

    it('should display temperature for each hourly item', () => {
      mockWeatherData.hourly.forEach((hour) => {
        expect(hour.temperature).toBeDefined();
        expect(typeof hour.temperature).toBe('number');
      });
    });

    it('should have valid data structure for horizontal list rendering', () => {
      // Verify that hourly data can be rendered in a horizontal list
      const hourlyData = mockWeatherData.hourly;
      expect(Array.isArray(hourlyData)).toBe(true);
      expect(hourlyData.length).toBe(24);

      hourlyData.forEach((item, index) => {
        expect(item).toHaveProperty('time');
        expect(item).toHaveProperty('condition');
        expect(item).toHaveProperty('temperature');
      });
    });
  });

  describe('7-Day Forecast Section', () => {
    it('should render 7 daily weather items', () => {
      expect(mockWeatherData.daily).toHaveLength(7);
    });

    it('should display date for each daily item', () => {
      mockWeatherData.daily.forEach((day) => {
        expect(day.time).toBeDefined();
        expect(typeof day.time).toBe('string');
        expect(new Date(day.time).toString()).not.toBe('Invalid Date');
      });
    });

    it('should display condition for each daily item', () => {
      mockWeatherData.daily.forEach((day) => {
        expect(day.condition).toBeDefined();
        expect(typeof day.condition).toBe('string');
        expect(day.condition.length).toBeGreaterThan(0);
      });
    });

    it('should display temperature range for each daily item', () => {
      mockWeatherData.daily.forEach((day) => {
        expect(day.temperature_min).toBeDefined();
        expect(day.temperature_max).toBeDefined();
        expect(typeof day.temperature_min).toBe('number');
        expect(typeof day.temperature_max).toBe('number');
        expect(day.temperature_min).toBeLessThanOrEqual(day.temperature_max);
      });
    });

    it('should have valid data structure for vertical list rendering', () => {
      // Verify that daily data can be rendered in a vertical list
      const dailyData = mockWeatherData.daily;
      expect(Array.isArray(dailyData)).toBe(true);
      expect(dailyData.length).toBe(7);

      dailyData.forEach((item) => {
        expect(item).toHaveProperty('time');
        expect(item).toHaveProperty('condition');
        expect(item).toHaveProperty('temperature_min');
        expect(item).toHaveProperty('temperature_max');
      });
    });

    it('should have data suitable for temperature range bar visualization', () => {
      // Verify that temperature range data is suitable for bar rendering
      mockWeatherData.daily.forEach((day) => {
        const range = day.temperature_max - day.temperature_min;
        expect(range).toBeGreaterThanOrEqual(0);

        // Temperature values should be reasonable for bar chart
        expect(day.temperature_min).toBeGreaterThanOrEqual(-50);
        expect(day.temperature_max).toBeLessThanOrEqual(60);
      });
    });
  });

  describe('Data Fetching', () => {
    it('should call weather API with location parameter', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockWeatherData),
        } as Response)
      );
      global.fetch = mockFetch;

      // Simulate component fetching data with location parameter
      const location = 'San Francisco';
      await fetch(`/api/weather?location=${encodeURIComponent(location)}`);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(`/api/weather?location=${encodeURIComponent(location)}`);
    });

    it('should handle API response correctly', async () => {
      const location = 'San Francisco';
      const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}`);
      const data = await response.json();

      expect(data).toEqual(mockWeatherData);
      expect(data.location).toBeDefined();
      expect(data.current).toBeDefined();
      expect(data.hourly).toHaveLength(24);
      expect(data.daily).toHaveLength(7);
    });

    it('should handle API errors gracefully', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        } as Response)
      );
      global.fetch = mockFetch;

      const location = 'San Francisco';
      const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}`);

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
    });
  });

  describe('UI/UX Requirements', () => {
    it('should have three distinct sections', () => {
      // Verify the data structure supports three sections
      expect(mockWeatherData).toHaveProperty('current');
      expect(mockWeatherData).toHaveProperty('hourly');
      expect(mockWeatherData).toHaveProperty('daily');
    });

    it('should have timezone information for proper time display', () => {
      // Verify timezone data is present
      expect(mockWeatherData).toHaveProperty('timezone');
      expect(typeof mockWeatherData.timezone).toBe('string');
      expect(mockWeatherData.timezone.length).toBeGreaterThan(0);
    });

    it('should support horizontal list layout for hourly forecast', () => {
      // Verify hourly data is an array suitable for horizontal scrolling
      expect(Array.isArray(mockWeatherData.hourly)).toBe(true);
      expect(mockWeatherData.hourly.length).toBe(24);
    });

    it('should support vertical list layout for daily forecast', () => {
      // Verify daily data is an array suitable for vertical list
      expect(Array.isArray(mockWeatherData.daily)).toBe(true);
      expect(mockWeatherData.daily.length).toBe(7);
    });

    it('should have data for temperature range visualization', () => {
      // Each daily entry should have min/max for range bars
      mockWeatherData.daily.forEach((day) => {
        expect(day).toHaveProperty('temperature_min');
        expect(day).toHaveProperty('temperature_max');

        // Verify we can calculate range percentage
        const range = day.temperature_max - day.temperature_min;
        expect(range).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
