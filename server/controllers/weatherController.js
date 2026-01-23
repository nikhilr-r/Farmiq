const axios = require('axios');
const NodeCache = require('node-cache');

// Cache TTL: 1 hour (3600 seconds)
const weatherCache = new NodeCache({ stdTTL: 3600 });

// Advisory Logic
const getAdvisory = (weather, lang = 'mr') => {
    // weather: { temp, wind_speed, humidity, rain_1h, id }
    const advisories = [];

    // 1. Rain
    if (weather.id >= 200 && weather.id <= 531) {
        advisories.push("आज पाऊस पडण्याची शक्यता आहे. फवारणी टाळावी. (Avoid spraying today due to rain)");
    }

    // 2. Wind (Standard: > 15-20 km/h is windy for spraying)
    // OWM returns m/s. 20 km/h ~= 5.5 m/s
    if (weather.wind_speed > 5.5) {
        advisories.push("वारे जोरात आहेत, कीटकनाशक फवारणी करताना काळजी घ्यावी. (High winds, be careful while spraying)");
    }

    // 3. Temperature
    if (weather.temp > 35) {
        advisories.push("दुपारी ३५°C पेक्षा जास्त तापमान असू शकते. दुपारी काम टाळा. (High temp > 35°C. Avoid noon work)");
    } else if (weather.temp < 10) {
        advisories.push("थंडी जास्त आहे, पिकांना पाणी द्यावे. (Cold weather, irrigate crops)");
    }

    // Default
    if (advisories.length === 0) {
        advisories.push("हवामान शेतीसाठी अनुकूल आहे. (Weather is favorable for farming)");
    }

    return advisories[0]; // Return the most critical advisory
};

const getWeatherByLocation = async (req, res) => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ message: 'Latitude and Longitude are required' });
        }

        // Cache Key: Round to 2 decimals to grouping nearby requests
        const latKey = parseFloat(lat).toFixed(2);
        const lonKey = parseFloat(lon).toFixed(2);
        const cacheKey = `weather_${latKey}_${lonKey}`;

        const cachedData = weatherCache.get(cacheKey);
        if (cachedData) {
            return res.status(200).json(cachedData);
        }

        const API_KEY = process.env.OPENWEATHER_API_KEY;
        if (!API_KEY) {
            // Fallback mock data if no key provided (For dev environment stability)
            console.warn('OPENWEATHER_API_KEY not found. Serving mock data.');
            return res.status(200).json({
                temp: 28,
                temp_min: 22,
                temp_max: 32,
                humidity: 45,
                wind_speed: 12,
                description: 'Partial Clouds',
                icon: '02d',
                location: 'Demo Location',
                advisory: "हवामान शेतीसाठी अनुकूल आहे.",
                isMock: true
            });
        }

        // Fetch from OpenWeatherMap (Current Weather)
        // https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}&units=metric&lang=mr
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: {
                lat,
                lon,
                appid: API_KEY,
                units: 'metric',
                lang: 'mr' // Request Marathi description directly
            }
        });

        const data = response.data;

        const weatherData = {
            temp: Math.round(data.main.temp),
            temp_min: Math.round(data.main.temp_min),
            temp_max: Math.round(data.main.temp_max),
            humidity: data.main.humidity,
            wind_speed: data.wind.speed, // m/s
            description: data.weather[0].description, // localized string from API
            icon: data.weather[0].icon,
            id: data.weather[0].id,
            location: data.name,
            dt: data.dt
        };

        // Add Advisory
        weatherData.advisory = getAdvisory({
            temp: weatherData.temp,
            wind_speed: weatherData.wind_speed,
            humidity: weatherData.humidity,
            id: weatherData.id
        });

        // Save to cache
        weatherCache.set(cacheKey, weatherData);

        res.status(200).json(weatherData);

    } catch (error) {
        console.error('Weather API Error:', error.message);
        res.status(500).json({ message: 'Error fetching weather data' });
    }
};

module.exports = { getWeatherByLocation };
