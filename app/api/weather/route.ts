import { NextRequest, NextResponse } from 'next/server';
import { WeatherResponse, Weather } from '@/app/types/weather';

const WEATHER_CONDITIONS = ['Sunny', 'Cloudy', 'Rain', 'Snow', 'Partly Cloudy', 'Thunderstorm'];

// Generate random number within range
function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Generate random integer within range
function randomIntInRange(min: number, max: number): number {
  return Math.floor(randomInRange(min, max + 1));
}

// Generate random condition
function randomCondition(): string {
  return WEATHER_CONDITIONS[randomIntInRange(0, WEATHER_CONDITIONS.length - 1)];
}

// Generate a single weather entry
function generateWeather(time: Date, isDaily = false): Weather {
  const baseTemp = randomInRange(-10, 40);
  const tempVariation = randomInRange(3, 10);
  
  const temperature_min = Math.round((baseTemp - tempVariation / 2) * 10) / 10;
  const temperature_max = Math.round((baseTemp + tempVariation / 2) * 10) / 10;
  const temperature = Math.round(baseTemp * 10) / 10;
  
  return {
    time: time.toISOString(),
    temperature,
    temperature_min,
    temperature_max,
    condition: randomCondition(),
    uv_index: randomIntInRange(0, 11),
  };
}

// Generate current weather
function generateCurrentWeather(): Weather {
  return generateWeather(new Date());
}

// Generate 24 hourly weather entries
function generateHourlyWeather(): Weather[] {
  const now = new Date();
  const hourly: Weather[] = [];
  
  for (let i = 0; i < 24; i++) {
    const time = new Date(now);
    time.setHours(now.getHours() + i);
    time.setMinutes(0);
    time.setSeconds(0);
    time.setMilliseconds(0);
    
    hourly.push(generateWeather(time));
  }
  
  return hourly;
}

// Generate 7 daily weather entries
function generateDailyWeather(): Weather[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daily: Weather[] = [];
  
  for (let i = 0; i < 7; i++) {
    const time = new Date(today);
    time.setDate(today.getDate() + i);
    
    daily.push(generateWeather(time, true));
  }
  
  return daily;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const location = searchParams.get('location') || 'San Francisco';
  
  const response: WeatherResponse = {
    location,
    current: generateCurrentWeather(),
    hourly: generateHourlyWeather(),
    daily: generateDailyWeather(),
  };
  
  return NextResponse.json(response);
}
