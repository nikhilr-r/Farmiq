import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config/api';
import useTranslation from '../i18n/useTranslation';
import { CloudRain } from 'lucide-react';

const WeatherCard = () => {
    const { t } = useTranslation();
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        const fetchWeather = async (lat, lon) => {
            try {
                const response = await axios.get(`${API_BASE}/api/v1/weather?lat=${lat}&lon=${lon}`);
                setWeather(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Weather fetch failed:", err);
                setError(t('weather.loading'));
                setLoading(false);
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => fetchWeather(position.coords.latitude, position.coords.longitude),
                () => { setError(t('weather.enableLocation')); setLoading(false); }
            );
        } else {
            setError("Browser not supported");
            setLoading(false);
        }
        return () => clearInterval(timer);
    }, []);

    const formatDateTime = (date) => {
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        const dateStr = date.toLocaleDateString('mr-IN', options);
        const timeStr = date.toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' });
        return `${dateStr} | ${timeStr}`;
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-r from-sky-100 to-sky-200 w-full h-32 animate-pulse flex flex-col justify-center items-center text-sky-500 rounded-2xl">
                <div className="spinner w-8 h-8 border-[3px] border-sky-200 border-t-sky-500" />
                <p className="mt-2 text-sm font-medium">{t('weather.loading')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-4 text-center text-red-500 font-semibold rounded-2xl border border-red-100 flex items-center justify-center gap-2">
                <CloudRain className="w-5 h-5" />
                {error}
            </div>
        );
    }

    if (weather) {
        return (
            <div className="bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white w-full px-5 py-4 rounded-2xl shadow-lg transition-all hover:shadow-xl">
                <p className="text-xs text-white/70 mb-2 font-medium">{formatDateTime(currentTime)}</p>
                <div className="flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-1">
                            <span className="text-3xl font-bold">{weather.temp_min}°</span>
                            <span className="text-lg text-white/60 font-medium">/ {weather.temp_max}°</span>
                        </div>
                        <p className="text-sm capitalize text-white/80 mt-0.5">{weather.description}</p>
                    </div>
                    <img src={`http://openweathermap.org/img/wn/${weather.icon}@2x.png`} alt="weather" className="w-16 h-16 -mr-1" />
                </div>
                {weather.advisory && (
                    <div className="mt-3 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2 text-xs font-medium">
                        📢 {weather.advisory}
                    </div>
                )}
            </div>
        );
    }
    return null;
};

export default WeatherCard;
