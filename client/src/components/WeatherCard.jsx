import { useState, useEffect } from 'react';
import axios from 'axios';

const WeatherCard = () => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        // Timer for live clock
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);

        const fetchWeather = async (lat, lon) => {
            try {
                // Determine API URL based on environment (Vite uses VITE_API_URL or hardcoded localhost for dev)
                // Assuming proxy or localhost:5000 for now based on context
                const response = await axios.get(`http://localhost:5000/api/v1/weather?lat=${lat}&lon=${lon}`);
                setWeather(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Weather fetch failed:", err);
                setError("हवामान माहिती उपलब्ध नाही");
                setLoading(false);
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchWeather(position.coords.latitude, position.coords.longitude);
                },
                (err) => {
                    console.error("Geolocation denied/error:", err);
                    setError("लोकेशन चालू करा");
                    setLoading(false);
                }
            );
        } else {
            setError("Browser not supported");
            setLoading(false);
        }

        return () => clearInterval(timer);
    }, []);

    // Marathi Date Formatter
    const formatDateTime = (date) => {
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        // Manual mapping for common Marathi time terms if standard API is insufficient
        // but 'mr-IN' usually works well.
        const dateStr = date.toLocaleDateString('mr-IN', options);
        const timeStr = date.toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' });
        return `${dateStr} | ${timeStr}`;
    };

    // Loading Skeleton (Hero Style)
    if (loading) {
        return (
            <div className="bg-sky-200 w-full h-48 animate-pulse flex flex-col justify-center items-center text-sky-700">
                <p>हवामान लोड होत आहे...</p>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="bg-red-50 p-4 text-center text-red-600 font-bold border-b-2 border-red-200">
                ⚠️ {error}
            </div>
        );
    }

    // Success State - HERO STYLE
    if (weather) {
        return (
            <div className="bg-gradient-to-r from-sky-300 to-sky-400 text-white 
                w-full px-4 py-3 rounded-2xl shadow-md">

                {/* Date & Time */}
                <p className="text-xs text-white/90 mb-1">
                    {formatDateTime(currentTime)}
                </p>

                <div className="flex justify-between items-center">

                    {/* Left Info */}
                    <div>
                        <p className="text-xl font-semibold">
                            {weather.temp_min}°C / {weather.temp_max}°C
                        </p>

                        <p className="text-sm capitalize opacity-90">
                            {weather.description}
                        </p>
                    </div>

                    {/* Right Icon */}
                    <img
                        src={`http://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                        alt="weather"
                        className="w-14 h-14"
                    />
                </div>

                {/* Advisory (VERY SUBTLE) */}
                {weather.advisory && (
                    <p className="mt-2 text-xs bg-white/20 rounded-lg px-2 py-1">
                        📢 {weather.advisory}
                    </p>
                )}
            </div>
        );
    }

    return null;
};

export default WeatherCard;
