import { createContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [preferences, setPreferences] = useState({
        language: 'mr', // Default Marathi
        district: '',
        taluka: ''
    });

    // Load from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem('farmiq_pref');
        if (stored) setPreferences(JSON.parse(stored));
    }, []);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem('farmiq_pref', JSON.stringify(preferences));
    }, [preferences]);

    const updatePreference = (key, value) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
    };

    return (
        <UserContext.Provider value={{ preferences, updatePreference }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
