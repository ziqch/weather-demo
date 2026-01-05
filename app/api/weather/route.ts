import { NextRequest, NextResponse } from 'next/server';
import { WeatherResponse, Weather } from '@/app/types/weather';

// WMO Weather interpretation codes
const WMO_WEATHER_CODES: Record<number, string> = {
  0: 'Clear',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Cloudy',
  45: 'Foggy',
  48: 'Foggy',
  51: 'Light Drizzle',
  53: 'Drizzle',
  55: 'Heavy Drizzle',
  56: 'Freezing Drizzle',
  57: 'Freezing Drizzle',
  61: 'Light Rain',
  63: 'Rain',
  65: 'Heavy Rain',
  66: 'Freezing Rain',
  67: 'Freezing Rain',
  71: 'Light Snow',
  73: 'Snow',
  75: 'Heavy Snow',
  77: 'Snow Grains',
  80: 'Light Rain Showers',
  81: 'Rain Showers',
  82: 'Heavy Rain Showers',
  85: 'Light Snow Showers',
  86: 'Snow Showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with Hail',
  99: 'Thunderstorm with Hail',
};

function getWeatherCondition(code: number): string {
  return WMO_WEATHER_CODES[code] || 'Unknown';
}

// Fetch coordinates from city name using Open-Meteo Geocoding API
async function getCoordinatesFromCity(cityName: string): Promise<{ lat: number; lon: number; location: string } | null> {
  try {
    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
    const geocodeResponse = await fetch(geocodeUrl);

    if (!geocodeResponse.ok) {
      return null;
    }

    const geocodeData = await geocodeResponse.json();

    if (geocodeData.results && geocodeData.results.length > 0) {
      const result = geocodeData.results[0];
      const parts = [];

      if (result.name) parts.push(result.name);
      if (result.admin1) parts.push(result.admin1);
      if (result.country) parts.push(result.country);

      return {
        lat: result.latitude,
        lon: result.longitude,
        location: parts.join(', ') || cityName,
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locationParam = searchParams.get('location');

  // Validate required parameters
  if (!locationParam) {
    return NextResponse.json(
      { error: 'Missing required parameter: location' },
      { status: 400 }
    );
  }

  try {
    // Get coordinates from city name
    const geocodeResult = await getCoordinatesFromCity(locationParam);

    if (!geocodeResult) {
      return NextResponse.json(
        { error: `Location not found: ${locationParam}` },
        { status: 404 }
      );
    }

    const { lat: latitude, lon: longitude, location } = geocodeResult;

    // Fetch weather data from Open-Meteo API
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,weather_code,uv_index` +
      `&hourly=temperature_2m,weather_code` +
      `&daily=temperature_2m_max,temperature_2m_min,weather_code,uv_index_max` +
      `&timezone=auto` +
      `&temperature_unit=celsius`;

    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      throw new Error('Failed to fetch weather data from Open-Meteo');
    }

    const weatherData = await weatherResponse.json();

    // Parse current weather
    const current: Weather = {
      time: weatherData.current.time,
      temperature: Math.round(weatherData.current.temperature_2m * 10) / 10,
      temperature_min: Math.round(weatherData.daily.temperature_2m_min[0] * 10) / 10,
      temperature_max: Math.round(weatherData.daily.temperature_2m_max[0] * 10) / 10,
      condition: getWeatherCondition(weatherData.current.weather_code),
      uv_index: Math.round(weatherData.current.uv_index) || 0,
    };

    // Parse hourly weather (next 24 hours)
    const hourly: Weather[] = [];
    for (let i = 0; i < 24; i++) {
      const temp = weatherData.hourly.temperature_2m[i];
      hourly.push({
        time: weatherData.hourly.time[i],
        temperature: Math.round(temp * 10) / 10,
        temperature_min: Math.round(temp * 10) / 10,
        temperature_max: Math.round(temp * 10) / 10,
        condition: getWeatherCondition(weatherData.hourly.weather_code[i]),
        uv_index: 0, // Hourly UV index not available in free tier
      });
    }

    // Parse daily weather (next 7 days)
    const daily: Weather[] = [];
    for (let i = 0; i < 7; i++) {
      const tempMin = weatherData.daily.temperature_2m_min[i];
      const tempMax = weatherData.daily.temperature_2m_max[i];
      const avgTemp = (tempMin + tempMax) / 2;

      daily.push({
        time: weatherData.daily.time[i],
        temperature: Math.round(avgTemp * 10) / 10,
        temperature_min: Math.round(tempMin * 10) / 10,
        temperature_max: Math.round(tempMax * 10) / 10,
        condition: getWeatherCondition(weatherData.daily.weather_code[i]),
        uv_index: Math.round(weatherData.daily.uv_index_max[i]) || 0,
      });
    }

    const response: WeatherResponse = {
      location,
      timezone: weatherData.timezone || 'UTC',
      current,
      hourly,
      daily,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
