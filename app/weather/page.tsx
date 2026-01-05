'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { WeatherResponse } from '../types/weather';

// Default city
const DEFAULT_CITY = 'San Francisco';

// Weather icon component
function getWeatherIcon(condition: string) {
  const lowerCondition = condition.toLowerCase();

  if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
    return '☀️';
  } else if (lowerCondition.includes('cloud')) {
    return '☁️';
  } else if (lowerCondition.includes('rain')) {
    return '🌧️';
  } else if (lowerCondition.includes('snow')) {
    return '❄️';
  } else if (lowerCondition.includes('storm') || lowerCondition.includes('thunder')) {
    return '⛈️';
  } else if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) {
    return '🌫️';
  } else if (lowerCondition.includes('wind')) {
    return '💨';
  } else if (lowerCondition.includes('partly')) {
    return '⛅';
  } else if (lowerCondition.includes('drizzle')) {
    return '🌦️';
  }

  return '🌤️'; // Default
}

export default function WeatherPage() {
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Fetch weather data based on location parameter
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get location from query parameter or use default
        const location = searchParams.get('location') || DEFAULT_CITY;
        const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}`);

        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }

        const weatherData: WeatherResponse = await response.json();
        setData(weatherData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [searchParams]);

  // Helper function to format time in the location's timezone
  const formatTime = (timeString: string, timezone: string, options: Intl.DateTimeFormatOptions) => {
    const date = new Date(timeString);
    return date.toLocaleString('en-US', { ...options, timeZone: timezone });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Loading weather data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Error</h2>
          <p className="text-gray-700 dark:text-gray-300">{error || 'Failed to load weather data'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Current Weather Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {data.location}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {formatTime(data.current.time, data.timezone, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-7xl mb-2">
                {getWeatherIcon(data.current.condition)}
              </div>
              <div className="text-6xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round(data.current.temperature)}°
              </div>
              <p className="text-xl text-gray-700 dark:text-gray-300 mt-2">
                {data.current.condition}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Min Temp</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {Math.round(data.current.temperature_min)}°
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Max Temp</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {Math.round(data.current.temperature_max)}°
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">UV Index</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {data.current.uv_index}
              </p>
            </div>
          </div>
        </div>

        {/* Hourly Forecast Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Hourly Forecast
          </h2>
          <div className="overflow-x-auto -mx-4 px-4">
            <div className="flex gap-4 min-w-max">
              {data.hourly.map((hour, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 min-w-[100px] shadow-md hover:shadow-lg transition-shadow"
                >
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {formatTime(hour.time, data.timezone, {
                      hour: 'numeric',
                      hour12: true,
                    })}
                  </p>
                  <div className="text-4xl my-2">
                    {getWeatherIcon(hour.condition)}
                  </div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 text-center">
                    {hour.condition}
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(hour.temperature)}°
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 7-Day Forecast Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            7-Day Forecast
          </h2>
          <div className="space-y-4">
            {data.daily.map((day, index) => {
              const minTemp = Math.round(day.temperature_min);
              const maxTemp = Math.round(day.temperature_max);
              const tempRange = 50; // Temperature range for visualization (-10 to 40)
              const minPosition = ((minTemp + 10) / tempRange) * 100;
              const maxPosition = ((maxTemp + 10) / tempRange) * 100;
              const barWidth = maxPosition - minPosition;

              return (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 hover:shadow-md transition-shadow"
                >
                  <div className="w-32">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatTime(day.time, data.timezone, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="w-32 flex items-center gap-2">
                    <span className="text-2xl">
                      {getWeatherIcon(day.condition)}
                    </span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {day.condition}
                    </p>
                  </div>

                  <div className="flex-1 flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-12 text-right">
                      {minTemp}°
                    </span>
                    <div className="flex-1 relative h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                      <div
                        className="absolute h-full bg-gradient-to-r from-blue-400 to-orange-400 rounded-full"
                        style={{
                          left: `${minPosition}%`,
                          width: `${barWidth}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-12">
                      {maxTemp}°
                    </span>
                  </div>

                  <div className="w-20 text-right">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      UV: {day.uv_index}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
