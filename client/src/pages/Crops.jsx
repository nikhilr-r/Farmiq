import { useState, useEffect } from 'react';
import axios from 'axios';

const Crops = () => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCrop, setSelectedCrop] = useState(null);

    useEffect(() => {
        fetchCrops();
    }, []);

    const fetchCrops = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/v1/crops');
            setCrops(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-6 mb-20">
            <h2 className="text-2xl font-bold text-green-800 mb-4">🌾 Crop Knowledge Hub</h2>

            {loading ? (
                <p>Loading crops...</p>
            ) : selectedCrop ? (
                // Detailed View
                <div>
                    <button
                        onClick={() => setSelectedCrop(null)}
                        className="text-green-700 underline mb-4 text-sm font-semibold"
                    >
                        ← Back to All Crops
                    </button>

                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="bg-green-600 px-6 py-4 text-white">
                            <h1 className="text-2xl font-bold">{selectedCrop.name.mr} ({selectedCrop.name.en})</h1>
                            <p className="opacity-90">{selectedCrop.season} Season</p>
                        </div>

                        <div className="p-6">
                            {/* Timeline */}
                            <h3 className="text-lg font-bold text-gray-800 mb-4">🗓️ Crop Timeline</h3>
                            <div className="border-l-2 border-green-300 ml-2 pl-6 space-y-6">
                                <div>
                                    <span className="text-sm font-bold text-green-600 block">Sowing Period</span>
                                    <p className="text-gray-700">{selectedCrop.sowingPeriod?.start} - {selectedCrop.sowingPeriod?.end}</p>
                                </div>

                                {selectedCrop.tasks?.map((task, idx) => (
                                    <div key={idx}>
                                        <span className="text-sm font-bold text-green-600 block">{task.stage}</span>
                                        <p className="text-gray-700 mb-1">{task.description}</p>
                                        {task.advisory && (
                                            <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded">💡 {task.advisory}</p>
                                        )}
                                    </div>
                                ))}

                                <div>
                                    <span className="text-sm font-bold text-green-600 block">Harvest Period</span>
                                    <p className="text-gray-700">{selectedCrop.harvestPeriod?.start} - {selectedCrop.harvestPeriod?.end}</p>
                                </div>
                            </div>

                            {/* Diseases */}
                            <h3 className="text-lg font-bold text-gray-800 mt-8 mb-4">🦠 Common Diseases</h3>
                            <div className="grid gap-3">
                                {selectedCrop.diseases?.map((d, idx) => (
                                    <div key={idx} className="bg-red-50 p-3 rounded border border-red-100">
                                        <p className="font-bold text-red-800">{d.name}</p>
                                        <p className="text-sm text-gray-600"><span className="font-semibold">Symptoms:</span> {d.symptoms}</p>
                                        <p className="text-sm text-gray-600"><span className="font-semibold">Solution:</span> {d.solution}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // List View
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {crops.map(crop => (
                        <div
                            key={crop._id}
                            onClick={() => setSelectedCrop(crop)}
                            className="bg-white p-4 rounded-xl shadow border border-green-100 flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition-all"
                            style={{ minHeight: '120px' }}
                        >
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl mb-2">🌱</div>
                            <h3 className="font-bold text-center text-gray-800">{crop.name.mr}</h3>
                            <p className="text-xs text-gray-500">{crop.name.en}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Crops;
