import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [myCrops, setMyCrops] = useState(() => {
        const saved = localStorage.getItem('myCrops');
        return saved ? JSON.parse(saved) : [];
    });
    const [userProfile, setUserProfile] = useState(() => {
        const saved = localStorage.getItem('userProfile');
        return saved ? JSON.parse(saved) : { name: "", district: "" };
    });

    useEffect(() => {
        localStorage.setItem('myCrops', JSON.stringify(myCrops));
    }, [myCrops]);

    useEffect(() => {
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }, [userProfile]);

    const addCrop = (cropData) => {
        // cropData should include: { id: uuid, cropId: string, name: string, sowingDate: string, district: string }
        setMyCrops(prev => [...prev, cropData]);
    };

    const removeCrop = (id) => {
        setMyCrops(prev => prev.filter(crop => crop.id !== id));
    };

    const updateUserProfile = (data) => {
        setUserProfile(prev => ({ ...prev, ...data }));
    };

    return (
        <UserContext.Provider value={{ myCrops, addCrop, removeCrop, userProfile, updateUserProfile }}>
            {children}
        </UserContext.Provider>
    );
};
