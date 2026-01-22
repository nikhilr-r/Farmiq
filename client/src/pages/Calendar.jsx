import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const Calendar = () => {
    const { myCrops, addCrop, removeCrop } = useUser();
    const [availableCrops, setAvailableCrops] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    // Which crop's timeline is currently being viewed? Default to the first one.
    const [activeTabCropId, setActiveTabCropId] = useState(null);
    const [expandedStageIndex, setExpandedStageIndex] = useState(null);

    // Form State
    const [selectedCropId, setSelectedCropId] = useState('');
    const [sowingDate, setSowingDate] = useState('');

    useEffect(() => {
        const fetchCrops = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/v1/crops');
                setAvailableCrops(res.data);
            } catch (err) {
                console.error("Failed to load crops", err);
            }
        };
        fetchCrops();
    }, []);

    // Set default active tab
    useEffect(() => {
        console.log("MyCrops:", myCrops, "ActiveTab:", activeTabCropId);
        if (myCrops.length > 0) {
            // If nothing active, or active ID no longer exists in myCrops (deleted)
            if (!activeTabCropId || !myCrops.find(c => c.id === activeTabCropId)) {
                console.log("Setting active tab to:", myCrops[0].id);
                setActiveTabCropId(myCrops[0].id);
            }
        } else {
            setActiveTabCropId(null);
        }
    }, [myCrops, activeTabCropId]);

    const handleAddCrop = (e) => {
        e.preventDefault();
        if (!selectedCropId || !sowingDate) return;

        const cropDetails = availableCrops.find(c => c._id === selectedCropId);

        const newId = uuidv4();
        addCrop({
            id: newId,
            cropId: selectedCropId,
            name: cropDetails.name,
            sowingDate: sowingDate
        });

        setIsAdding(false);
        setActiveTabCropId(newId); // Switch to new crop
        setSelectedCropId('');
        setSowingDate('');
    };

    // --- TIMELINE LOGIC ---
    const getTimelineData = (userCrop) => {
        const cropData = availableCrops.find(c => c._id === userCrop.cropId);
        if (!cropData) return [];

        const sownDate = new Date(userCrop.sowingDate);
        const today = new Date();
        const diffTime = today - sownDate;
        const daysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // Sort tasks by start day
        const sortedTasks = [...cropData.tasks].sort((a, b) =>
            (a.daysAfterSowing?.start || 0) - (b.daysAfterSowing?.start || 0)
        );

        return sortedTasks.map((task, index) => {
            const start = task.daysAfterSowing?.start ?? -999;
            const end = task.daysAfterSowing?.end ?? -999;

            let status = 'upcoming'; // pending
            if (daysElapsed > end) status = 'completed';
            else if (daysElapsed >= start && daysElapsed <= end) status = 'current';

            return {
                ...task,
                status,
                isExpanded: index === expandedStageIndex || status === 'current' // Auto-expand current
            };
        });
    };

    const activeUserCrop = myCrops.find(c => c.id === activeTabCropId);
    const timelineEvents = activeUserCrop ? getTimelineData(activeUserCrop) : [];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-green-700 text-white p-4 shadow-md sticky top-0 z-20">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">🌾 पीक सल्ला (Crop Advisory)</h1>
                        <p className="text-xs text-green-100">See what to do at every stage.</p>
                    </div>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="bg-white text-green-800 px-3 py-1.5 rounded-full text-sm font-bold shadow hover:bg-green-50 transition"
                    >
                        {isAdding ? 'Cancel' : '+ Add Crop'}
                    </button>
                </div>
            </div>

            {/* Add Crop Form */}
            {isAdding && (
                <div className="m-4 bg-white p-4 rounded-xl shadow-lg border-2 border-green-100 animate-slideDown z-30 relative">
                    <h3 className="font-bold text-gray-700 mb-3">Add New Crop</h3>
                    <form onSubmit={handleAddCrop} className="space-y-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Select Crop</label>
                            <select
                                className="w-full p-2 border rounded-lg bg-gray-50"
                                value={selectedCropId}
                                onChange={(e) => setSelectedCropId(e.target.value)}
                                required
                            >
                                <option value="">Choose Crop...</option>
                                {availableCrops.map(c => (
                                    <option key={c._id} value={c._id}>{c.name.mr} ({c.name.en})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Sowing Date (पेरणी तारीख)</label>
                            <input
                                type="date"
                                className="w-full p-2 border rounded-lg bg-gray-50"
                                value={sowingDate}
                                onChange={(e) => setSowingDate(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg font-bold shadow">
                            Save Crop
                        </button>
                    </form>
                </div>
            )}

            {/* Crop Tabs */}
            {myCrops.length > 0 && (
                <div className="bg-white shadow-sm border-b border-gray-200 sticky top-16 z-10 overflow-x-auto no-scrollbar">
                    <div className="flex p-2 space-x-2">
                        {myCrops.map(crop => (
                            <button
                                key={crop.id}
                                onClick={() => setActiveTabCropId(crop.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${activeTabCropId === crop.id
                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                    : 'bg-gray-50 text-gray-500 border border-transparent'
                                    }`}
                            >
                                <span>{crop.name.mr}</span>
                                {activeTabCropId === crop.id && (
                                    <span
                                        onClick={(e) => { e.stopPropagation(); removeCrop(crop.id); if (activeTabCropId === crop.id) setActiveTabCropId(null); }}
                                        className="text-red-400 hover:text-red-600 ml-1 text-base font-black px-1"
                                    >
                                        ×
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* TIMELINE CONTENT */}
            <div className="p-4 container mx-auto max-w-lg">
                {!activeUserCrop ? (
                    !isAdding && (
                        <div className="text-center py-12">
                            <div className="bg-green-50 inline-block p-4 rounded-full mb-4">
                                <span className="text-4xl">🌱</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-700">No Crops Added</h3>
                            <p className="text-gray-500 mb-4">Add your crop to see the advisory timeline.</p>
                            <button onClick={() => setIsAdding(true)} className="text-green-600 font-bold underline">
                                + Add Your First Crop
                            </button>
                        </div>
                    )
                ) : (
                    <div>
                        {/* Info Card */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Sowing Date</p>
                                <p className="text-lg font-bold text-gray-800">
                                    {new Date(activeUserCrop.sowingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase font-bold">Crop Age</p>
                                <p className="text-lg font-bold text-green-600">
                                    {Math.floor((new Date() - new Date(activeUserCrop.sowingDate)) / (1000 * 60 * 60 * 24))} Days
                                </p>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="relative border-l-2 border-gray-300 ml-4 space-y-8 pl-8 py-2">
                            {timelineEvents.map((stage, idx) => (
                                <div key={idx} className="relative">
                                    {/* Icon Indicator */}
                                    <div className={`absolute -left-[41px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 ${stage.status === 'completed' ? 'bg-green-500 border-green-500' :
                                        stage.status === 'current' ? 'bg-white border-orange-500 scale-125' :
                                            'bg-gray-100 border-gray-300'
                                        }`}>
                                        {stage.status === 'completed' && <span className="text-white text-xs font-bold">✓</span>}
                                        {stage.status === 'current' && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse"></div>}
                                    </div>

                                    {/* Content Card */}
                                    <div className={`transition-all duration-300 ${stage.status === 'current' ? 'opacity-100' :
                                        stage.status === 'completed' ? 'opacity-80' : 'opacity-60 grayscale'
                                        }`}>
                                        <div
                                            onClick={() => setExpandedStageIndex(expandedStageIndex === idx ? null : idx)}
                                            className={`bg-white rounded-lg shadow-sm border cursor-pointer p-4 hover:shadow-md transition-shadow ${stage.status === 'current' ? 'border-orange-400 ring-1 ring-orange-100' : 'border-gray-100'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className={`font-bold text-lg ${stage.status === 'current' ? 'text-orange-700' :
                                                        stage.status === 'completed' ? 'text-green-700' : 'text-gray-600'
                                                        }`}>
                                                        {stage.stage}
                                                    </h3>
                                                    {stage.daysAfterSowing && (
                                                        <p className="text-xs text-gray-400 font-mono mt-0.5">
                                                            Day {stage.daysAfterSowing.start} - {stage.daysAfterSowing.end}
                                                        </p>
                                                    )}
                                                </div>
                                                <button className="text-blue-500 text-xs font-bold bg-blue-50 px-2 py-1 rounded">
                                                    {expandedStageIndex === idx || stage.status === 'current' ? 'Hide Info' : 'More Info'}
                                                </button>
                                            </div>

                                            {/* Collapsible Content */}
                                            {(expandedStageIndex === idx || stage.status === 'current') && (
                                                <div className="mt-3 text-sm text-gray-600 border-t border-gray-100 pt-3">
                                                    <p className="mb-2"><strong className="text-gray-800">Kruti (Action):</strong> {stage.description}</p>
                                                    <p className="bg-yellow-50 p-2 rounded border border-yellow-100 text-yellow-800">
                                                        💡 <strong>Tip:</strong> {stage.advisory}
                                                    </p>
                                                    {/* Placeholder for future images */}
                                                    {/* <div className="mt-2 h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">Image Placeholder</div> */}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* End of Timeline */}
                        <div className="ml-4 pl-8 pt-2 pb-10">
                            <div className="text-gray-400 text-sm italic">
                                --- Harvest / End of Season ---
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Calendar;
