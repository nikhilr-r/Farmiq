import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    // Legacy generic preferences
    const [preferences, setPreferences] = useState(() => {
        const saved = localStorage.getItem('userPreferences');
        return saved ? JSON.parse(saved) : { district: '', language: 'mr' };
    });

    // New Farmer Auth State
    const [farmer, setFarmer] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('farmer_token') || null);
    const [loading, setLoading] = useState(true);

    const updatePreference = (key, value) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
    };

    // Load Farmer profile if token exists
    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const res = await axios.get('http://localhost:5000/api/v1/farmer/auth/me', {
                        headers: { 'x-auth-token': token }
                    });
                    setFarmer(res.data);
                    // Sync loaded language preference
                    if (res.data.language) {
                        updatePreference('language', res.data.language);
                    }
                } catch (err) {
                    console.error('Failed to load farmer profile', err);
                    logoutFarmer();
                }
            }
            setLoading(false);
        };

        loadUser();
    }, [token]);

    useEffect(() => {
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
    }, [preferences]);

    // Auth Actions
    const loginFarmer = (jwtToken) => {
        localStorage.setItem('farmer_token', jwtToken);
        setToken(jwtToken);
    };

    const logoutFarmer = () => {
        localStorage.removeItem('farmer_token');
        setToken(null);
        setFarmer(null);
    };

    return (
        <UserContext.Provider value={{
            preferences,
            updatePreference,
            farmer,
            token,
            isAuthenticated: !!token && !!farmer,
            loading,
            loginFarmer,
            logoutFarmer
        }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
