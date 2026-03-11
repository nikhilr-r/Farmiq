import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config/api';
import useTranslation from '../i18n/useTranslation';
import { Sprout } from 'lucide-react';

const Crops = () => {
    const { t, lang } = useTranslation();
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCrop, setSelectedCrop] = useState(null);

    useEffect(() => { fetchCrops(); }, []);

    const fetchCrops = async () => {
        try { const res = await axios.get(`${API_BASE}/api/v1/crops`); setCrops(res.data); setLoading(false); }
        catch (err) { console.error(err); setLoading(false); }
    };

    const localize = (obj) => obj?.[lang] || obj?.mr || obj?.en || '';

    return (
        <div className="container mx-auto px-4 py-6 mb-20 animate-fadeInUp">
            <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-2">
                <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center"><Sprout className="w-5 h-5 text-green-600" /></div>
                {t('crops.title')}
            </h2>

            {loading ? (
                <div className="flex flex-col items-center py-16">
                    <div className="spinner w-10 h-10 border-[3px] border-green-200 border-t-green-600" />
                    <p className="text-gray-400 mt-4 text-sm">{t('crops.loading')}</p>
                </div>
            ) : selectedCrop ? (
                <div>
                    <button onClick={() => setSelectedCrop(null)} className="text-green-700 underline mb-4 text-sm font-semibold">{t('crops.back')}</button>
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="bg-green-600 px-6 py-4 text-white">
                            <h1 className="text-2xl font-bold">{localize(selectedCrop.name)}</h1>
                            <p className="opacity-90">{selectedCrop.season} {t('crops.season')}</p>
                        </div>
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">🗓️ {t('crops.timeline')}</h3>
                            <div className="border-l-2 border-green-300 ml-2 pl-6 space-y-6">
                                <div>
                                    <span className="text-sm font-bold text-green-600 block">{t('crops.sowing')}</span>
                                    <p className="text-gray-700">{selectedCrop.sowingPeriod?.start} - {selectedCrop.sowingPeriod?.end}</p>
                                </div>
                                {selectedCrop.tasks?.map((task, idx) => (
                                    <div key={idx}>
                                        <span className="text-sm font-bold text-green-600 block">{task.stage}</span>
                                        <p className="text-gray-700 mb-1">{task.description}</p>
                                        {task.advisory && <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded">💡 {task.advisory}</p>}
                                    </div>
                                ))}
                                <div>
                                    <span className="text-sm font-bold text-green-600 block">{t('crops.harvest')}</span>
                                    <p className="text-gray-700">{selectedCrop.harvestPeriod?.start} - {selectedCrop.harvestPeriod?.end}</p>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-800 mt-8 mb-4">🦠 {t('crops.diseases')}</h3>
                            <div className="grid gap-3">
                                {selectedCrop.diseases?.map((d, idx) => (
                                    <div key={idx} className="bg-red-50 p-3 rounded border border-red-100">
                                        <p className="font-bold text-red-800">{d.name}</p>
                                        <p className="text-sm text-gray-600"><span className="font-semibold">{t('crops.symptoms')}</span> {d.symptoms}</p>
                                        <p className="text-sm text-gray-600"><span className="font-semibold">{t('crops.solution')}</span> {d.solution}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {crops.map(crop => (
                        <div key={crop._id} onClick={() => setSelectedCrop(crop)} className="bg-white p-4 rounded-xl shadow border border-green-100 flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition-all" style={{ minHeight: '120px' }}>
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl mb-2">🌱</div>
                            <h3 className="font-bold text-center text-gray-800">{localize(crop.name)}</h3>
                            <p className="text-xs text-gray-500">{lang !== 'mr' ? crop.name.mr : crop.name.en}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Crops;
