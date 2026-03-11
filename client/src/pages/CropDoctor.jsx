import { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import UserContext from '../context/UserContext';
import useTranslation from '../i18n/useTranslation';
import axios from 'axios';
import API_BASE from '../config/api';

const CropDoctor = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { farmer, token, isAuthenticated, loading } = useContext(UserContext);
    const { t, lang } = useTranslation();
    const fileInputRef = useRef(null);

    const [imageData, setImageData] = useState(null);
    const [fileName, setFileName] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('result');
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [selectedCrop, setSelectedCrop] = useState('');
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => { if (!loading && !isAuthenticated) navigate('/login'); }, [loading, isAuthenticated, navigate]);

    useEffect(() => {
        if (location.state?.imageData) { setImageData(location.state.imageData); setFileName(location.state.fileName || 'captured_image.jpg'); setShowHistory(false); }
        if (location.state?.showHistory) { setShowHistory(true); loadHistory(); }
    }, [location.state]);

    const loadHistory = async () => {
        setHistoryLoading(true);
        try { const res = await axios.get(`${API_BASE}/api/v1/diagnosis/history`, { headers: { 'x-auth-token': token } }); setHistory(res.data); }
        catch (err) { console.error('Failed to load history:', err); }
        setHistoryLoading(false);
    };

    const handleAnalyze = async () => {
        if (!imageData) return;
        setAnalyzing(true); setError(null); setResult(null);
        try {
            const res = await axios.post(`${API_BASE}/api/v1/diagnosis/analyze`, { image: imageData, cropName: selectedCrop }, { headers: { 'x-auth-token': token } });
            setResult(res.data);
        } catch (err) { setError(err.response?.data?.msg || t('doctor.analysisFailed')); }
        setAnalyzing(false);
    };

    const handleNewUpload = () => { if (fileInputRef.current) fileInputRef.current.click(); };
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) { const reader = new FileReader(); reader.onloadend = () => { setImageData(reader.result); setFileName(file.name); setResult(null); setError(null); setShowHistory(false); }; reader.readAsDataURL(file); }
        e.target.value = '';
    };
    const clearImage = () => { setImageData(null); setFileName(''); setResult(null); setError(null); };

    const getSeverityConfig = (severity) => {
        const configs = {
            healthy: { color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: '✅', label: t('severity.healthy') },
            low: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: '🔵', label: t('severity.low') },
            medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '🟡', label: t('severity.medium') },
            high: { color: 'bg-orange-100 text-orange-800 border-orange-300', icon: '🟠', label: t('severity.high') },
            critical: { color: 'bg-red-100 text-red-800 border-red-300', icon: '🔴', label: t('severity.critical') },
        };
        return configs[severity] || configs.medium;
    };

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" /></div>;

    return (
        <div className="px-4 py-6 max-w-2xl mx-auto">
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />

            {/* Header */}
            <div className="mb-6 animate-slideUp">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                            <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
                            <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                            <line x1="7" y1="12" x2="17" y2="12" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">{t('doctor.title')}</h1>
                        <p className="text-xs text-gray-500">{t('doctor.subtitle')}</p>
                    </div>
                </div>

                <div className="flex gap-2 mt-4">
                    <button onClick={() => { setShowHistory(false); }} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${!showHistory ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {t('doctor.analysis')}
                    </button>
                    <button onClick={() => { setShowHistory(true); loadHistory(); }} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${showHistory ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {t('doctor.reports')}
                    </button>
                </div>
            </div>

            {/* Analysis Mode */}
            {!showHistory && (
                <div>
                    {!imageData ? (
                        <div className="animate-slideUp border-2 border-dashed border-green-300 rounded-2xl p-8 text-center bg-gradient-to-br from-green-50 to-emerald-50 cursor-pointer hover:border-green-400 hover:shadow-md transition-all group" onClick={handleNewUpload} style={{ animationDelay: '0.1s' }}>
                            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform animate-pulseGlow">
                                <svg viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.5" className="w-10 h-10">
                                    <path d="M3 7V5a2 2 0 0 1 2-2h2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M17 3h2a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M21 17v2a2 2 0 0 1-2 2h-2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M7 21H5a2 2 0 0 1-2-2v-2" strokeLinecap="round" strokeLinejoin="round" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-700 mb-1">{t('doctor.uploadTitle')}</h3>
                            <p className="text-sm text-gray-500 mb-4">{t('doctor.uploadSubtitle')}</p>
                            <div className="flex justify-center gap-3">
                                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-600 shadow-sm border border-gray-200">{t('doctor.camera')}</span>
                                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-600 shadow-sm border border-gray-200">{t('doctor.gallery')}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-slideUp" style={{ animationDelay: '0.1s' }}>
                            <div className="relative rounded-2xl overflow-hidden shadow-lg mb-4">
                                <img src={imageData} alt="Crop preview" className="w-full h-56 object-cover" />
                                {analyzing && (<div className="absolute inset-0 bg-black/10"><div className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-green-400 to-transparent" style={{ animation: 'scanLine 2s ease-in-out infinite' }} /></div>)}
                                <button onClick={clearImage} className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-sm transition-colors">✕</button>
                                <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/50 text-white text-xs rounded-full backdrop-blur-sm">{fileName}</div>
                            </div>

                            {farmer?.cropsGrown?.length > 0 && (
                                <div className="mb-4">
                                    <label className="text-sm font-medium text-gray-600 mb-1 block">{t('doctor.selectCrop')}</label>
                                    <select value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                        <option value="">{t('doctor.autoDetect')}</option>
                                        {farmer.cropsGrown.map((crop) => <option key={crop._id} value={crop.name?.en || crop.name?.mr}>{crop.name?.mr || crop.name?.en}</option>)}
                                    </select>
                                </div>
                            )}

                            {!result && (
                                <button onClick={handleAnalyze} disabled={analyzing} className={`w-full py-3.5 rounded-xl font-bold text-white text-base shadow-lg transition-all active:scale-[0.98] ${analyzing ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-xl animate-pulseGlow'}`}>
                                    {analyzing ? <span className="flex items-center justify-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t('doctor.analyzing')}</span> : <span className="flex items-center justify-center gap-2">{t('doctor.analyze')}</span>}
                                </button>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl animate-slideUp">
                            <div className="flex items-start gap-3">
                                <span className="text-xl">⚠️</span>
                                <div><p className="text-sm font-semibold text-red-700">{t('doctor.analysisFailed')}</p><p className="text-sm text-red-600 mt-1">{error}</p></div>
                            </div>
                            <button onClick={handleAnalyze} className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">{t('doctor.retry')}</button>
                        </div>
                    )}

                    {result && (
                        <div className="mt-5 space-y-4">
                            <div className="animate-slideUp bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div><p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{t('doctor.diagnosis')}</p><h2 className="text-lg font-bold text-gray-800">{result.diagnosis?.diseaseName || 'Unknown Disease'}</h2></div>
                                        {result.diagnosis?.severity && <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityConfig(result.diagnosis.severity).color}`}>{getSeverityConfig(result.diagnosis.severity).icon} {getSeverityConfig(result.diagnosis.severity).label}</span>}
                                    </div>
                                    {result.diagnosis?.confidence && (
                                        <div className="mb-3">
                                            <div className="flex justify-between text-xs text-gray-500 mb-1"><span>{t('doctor.confidence')}</span><span className="font-semibold">{Math.round(result.diagnosis.confidence * 100)}%</span></div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${result.diagnosis.confidence * 100}%` }} /></div>
                                        </div>
                                    )}
                                    <p className="text-sm text-gray-600 leading-relaxed">{result.diagnosis?.description || ''}</p>
                                </div>
                            </div>

                            {result.advisory && (
                                <div className="animate-slideUp bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden" style={{ animationDelay: '0.15s' }}>
                                    <div className="flex border-b border-gray-100 overflow-x-auto">
                                        {[
                                            { key: 'immediate', labelKey: 'advisory.immediate' },
                                            { key: 'preventive', labelKey: 'advisory.preventive' },
                                            { key: 'organic', labelKey: 'advisory.organic' },
                                            { key: 'chemical', labelKey: 'advisory.chemical' },
                                        ].map((tab) => (
                                            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 min-w-fit px-4 py-3 text-xs font-semibold transition-colors whitespace-nowrap ${activeTab === tab.key ? 'text-green-700 border-b-2 border-green-600 bg-green-50/50' : 'text-gray-500 hover:text-gray-700'}`}>
                                                {t(tab.labelKey)}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="p-5">
                                        {result.advisory[activeTab] ? (
                                            <ul className="space-y-2">{(Array.isArray(result.advisory[activeTab]) ? result.advisory[activeTab] : [result.advisory[activeTab]]).map((step, i) => (
                                                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700"><span className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span><span className="leading-relaxed">{step}</span></li>
                                            ))}</ul>
                                        ) : <p className="text-sm text-gray-400 text-center py-4">{t('doctor.noDataAvailable')}</p>}
                                    </div>
                                </div>
                            )}

                            {result.weatherContext && (
                                <div className="animate-slideUp bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-5 border border-blue-100" style={{ animationDelay: '0.25s' }}>
                                    <div className="flex items-center gap-2 mb-3"><span className="text-lg">🌤️</span><h3 className="text-sm font-bold text-blue-800">{t('weather.conditions')}</h3></div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="text-center p-2 bg-white/60 rounded-xl"><p className="text-lg font-bold text-blue-700">{result.weatherContext.temp}°C</p><p className="text-[10px] text-blue-500">{t('weather.temp')}</p></div>
                                        <div className="text-center p-2 bg-white/60 rounded-xl"><p className="text-lg font-bold text-blue-700">{result.weatherContext.humidity}%</p><p className="text-[10px] text-blue-500">{t('weather.humidity')}</p></div>
                                        <div className="text-center p-2 bg-white/60 rounded-xl"><p className="text-lg font-bold text-blue-700">{result.weatherContext.wind_speed}</p><p className="text-[10px] text-blue-500">{t('weather.wind')}</p></div>
                                    </div>
                                    {result.weatherContext.advisory && <p className="mt-3 text-xs text-blue-600 bg-white/50 rounded-lg p-2">💡 {result.weatherContext.advisory}</p>}
                                </div>
                            )}

                            {result.cropStageContext && (
                                <div className="animate-slideUp bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-5 border border-amber-100" style={{ animationDelay: '0.35s' }}>
                                    <div className="flex items-center gap-2 mb-3"><span className="text-lg">🌱</span><h3 className="text-sm font-bold text-amber-800">{t('stage.title')}</h3></div>
                                    <div className="flex items-center gap-3 bg-white/60 rounded-xl p-3">
                                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-lg">🌾</div>
                                        <div><p className="text-sm font-bold text-amber-800">{result.cropStageContext.stage || 'N/A'}</p><p className="text-xs text-amber-600">{result.cropStageContext.description || ''}</p></div>
                                    </div>
                                    {result.cropStageContext.advisory && <p className="mt-3 text-xs text-amber-600 bg-white/50 rounded-lg p-2">💡 {result.cropStageContext.advisory}</p>}
                                </div>
                            )}

                            <button onClick={clearImage} className="w-full py-3 rounded-xl font-semibold text-green-700 bg-green-50 border-2 border-green-200 hover:bg-green-100 transition-colors animate-slideUp" style={{ animationDelay: '0.4s' }}>
                                {t('doctor.newScan')}
                            </button>
                        </div>
                    )}

                    {analyzing && !result && (
                        <div className="mt-5 space-y-4">
                            <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100 animate-slideUp">
                                <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-full animate-shimmer" /><div className="flex-1 space-y-2"><div className="h-4 w-3/4 rounded animate-shimmer" /><div className="h-3 w-1/2 rounded animate-shimmer" /></div></div>
                                <div className="space-y-2"><div className="h-3 rounded animate-shimmer" /><div className="h-3 w-5/6 rounded animate-shimmer" /><div className="h-3 w-4/6 rounded animate-shimmer" /></div>
                            </div>
                            <p className="text-center text-sm text-gray-500 animate-pulse">{t('doctor.aiAnalyzing')}</p>
                        </div>
                    )}
                </div>
            )}

            {/* History Mode */}
            {showHistory && (
                <div>
                    {historyLoading ? (
                        <div className="space-y-3">{[1, 2, 3].map((i) => (<div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"><div className="flex gap-3"><div className="w-16 h-16 rounded-lg animate-shimmer" /><div className="flex-1 space-y-2"><div className="h-4 w-3/4 rounded animate-shimmer" /><div className="h-3 w-1/2 rounded animate-shimmer" /><div className="h-3 w-1/3 rounded animate-shimmer" /></div></div></div>))}</div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-16 animate-slideUp">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-3xl">📋</span></div>
                            <h3 className="text-lg font-bold text-gray-700 mb-2">{t('doctor.noReports')}</h3>
                            <p className="text-sm text-gray-500 mb-6">{t('doctor.noReportsHint')}</p>
                            <button onClick={() => setShowHistory(false)} className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-medium text-sm shadow-md hover:shadow-lg transition-shadow">{t('doctor.startScan')}</button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.map((report, idx) => {
                                const sev = getSeverityConfig(report.diagnosis?.severity);
                                return (
                                    <div key={report._id || idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer animate-slideUp" style={{ animationDelay: `${idx * 0.08}s` }}
                                        onClick={() => { setResult(report); setImageData(report.imageBase64); setShowHistory(false); }}>
                                        <div className="flex gap-3">
                                            {report.imageBase64 && <img src={report.imageBase64} alt="Crop" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1"><h3 className="text-sm font-bold text-gray-800 truncate">{report.diagnosis?.diseaseName || 'Unknown'}</h3><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${sev.color}`}>{sev.icon} {sev.label}</span></div>
                                                {report.cropName && <p className="text-xs text-gray-500 mb-1">🌾 {report.cropName}</p>}
                                                <p className="text-[10px] text-gray-400">{new Date(report.createdAt).toLocaleDateString('mr-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                            </div>
                                            <div className="flex items-center text-gray-300"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CropDoctor;
