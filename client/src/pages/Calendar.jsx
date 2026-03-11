import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config/api';
import useTranslation from '../i18n/useTranslation';

const Calendar = () => {
    const { t, lang } = useTranslation();
    const [crops, setCrops] = useState([]);
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [sowingDate, setSowingDate] = useState(() => {
        return localStorage.getItem('sowingDate') || new Date().toISOString().split('T')[0];
    });
    const [elapsedDays, setElapsedDays] = useState(0);

    useEffect(() => {
        const fetchCrops = async () => {
            try {
                const response = await axios.get(`${API_BASE}/api/v1/crops`);
                setCrops(response.data);
                if (response.data.length > 0) {
                    const savedCropId = localStorage.getItem('selectedCropId');
                    setSelectedCrop(response.data.find(c => c._id === savedCropId) || response.data[0]);
                }
            } catch (error) { console.error("Error fetching crops:", error); }
        };
        fetchCrops();
    }, []);

    useEffect(() => {
        if (sowingDate) {
            const diffDays = Math.floor((new Date() - new Date(sowingDate)) / (1000 * 60 * 60 * 24));
            setElapsedDays(diffDays < 0 ? 0 : diffDays);
            localStorage.setItem('sowingDate', sowingDate);
        }
    }, [sowingDate]);

    useEffect(() => { if (selectedCrop) localStorage.setItem('selectedCropId', selectedCrop._id); }, [selectedCrop]);

    const getStageStatus = (task) => {
        if (!task.daysAfterSowing) return 'PENDING';
        const { start, end } = task.daysAfterSowing;
        if (elapsedDays > end) return 'COMPLETED';
        if (elapsedDays >= start && elapsedDays <= end) return 'CURRENT';
        return 'PENDING';
    };

    const localize = (obj) => obj?.[lang] || obj?.mr || obj?.en || '';

    if (!selectedCrop) return <div className="p-4 text-center">{t('calendar.loadingCrops')}</div>;

    return (
        <div className="container mx-auto p-4 min-h-screen bg-gray-50">
            <div className="bg-green-600 p-4 rounded-t-xl shadow-md text-white flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold">{t('calendar.title')}</h1>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('calendar.sowingDate')}</label>
                    <input type="date" value={sowingDate} onChange={(e) => setSowingDate(e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border" />
                </div>
                <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('calendar.selectCrop')}</label>
                    <select value={selectedCrop._id} onChange={(e) => setSelectedCrop(crops.find(c => c._id === e.target.value))} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border">
                        {crops.map(crop => <option key={crop._id} value={crop._id}>{localize(crop.name)}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex c gap-4 text-xs mb-6 overflow-x-auto text-gray-600 px-2">
                <div className="flex items-center gap-1 whitespace-nowrap"><div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px]">✓</div><span>{t('calendar.completed')}</span></div>
                <div className="flex items-center gap-1 whitespace-nowrap"><div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-sm"></div><span>{t('calendar.current')}</span></div>
                <div className="flex items-center gap-1 whitespace-nowrap"><div className="w-4 h-4 rounded-full bg-gray-300"></div><span>{t('calendar.pending')}</span></div>
                <div className="ml-auto font-bold text-green-700">{t('calendar.days')} {elapsedDays}</div>
            </div>

            <div className="relative pl-4">
                <div className="absolute left-[22px] top-0 bottom-0 w-0.5 bg-gray-200 -z-10"></div>
                <div className="space-y-6">
                    {selectedCrop.tasks && selectedCrop.tasks.map((task, idx) => {
                        const status = getStageStatus(task);
                        return (
                            <div key={idx} className="relative flex gap-4">
                                <div className="mt-1 flex-shrink-0">
                                    {status === 'COMPLETED' && <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white shadow-sm border-2 border-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>}
                                    {status === 'CURRENT' && <div className="w-6 h-6 rounded-full bg-orange-500 border-2 border-white shadow-md ring-2 ring-orange-200"></div>}
                                    {status === 'PENDING' && <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white"></div>}
                                </div>
                                <div className={`flex-grow bg-white rounded-lg p-4 shadow-sm border ${status === 'CURRENT' ? 'border-orange-200 ring-1 ring-orange-100' : 'border-gray-100'}`}>
                                    <div className="flex justify-between items-start">
                                        <h3 className={`font-bold text-lg ${status === 'CURRENT' ? 'text-orange-700' : 'text-gray-800'}`}>{task.stage}</h3>
                                        {task.daysAfterSowing && <span className="text-xs text-gray-400 font-mono">Day {task.daysAfterSowing.start}-{task.daysAfterSowing.end}</span>}
                                    </div>
                                    <div className="mt-2 text-gray-600 text-sm leading-relaxed">{task.description}</div>
                                    {status === 'CURRENT' && task.advisory && (
                                        <div className="mt-3 bg-blue-50 p-3 rounded-md border border-blue-100">
                                            <h4 className="text-xs font-bold text-blue-700 uppercase mb-1">💡 {t('calendar.advisory')}</h4>
                                            <p className="text-sm text-blue-800">{task.advisory}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-12 text-center text-gray-400 text-xs">{t('calendar.disclaimer')}</div>
        </div>
    );
};

export default Calendar;
