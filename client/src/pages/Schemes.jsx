import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE from '../config/api';
import UserContext from '../context/UserContext';
import useTranslation from '../i18n/useTranslation';
import { Search, ChevronDown, ChevronUp, ExternalLink, Calendar, CheckCircle, FileText, ClipboardList, MapPin } from 'lucide-react';

const Schemes = () => {
    const { preferences } = useContext(UserContext);
    const { t, lang } = useTranslation();
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('STATE');
    const [expandedSchemeId, setExpandedSchemeId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { fetchSchemes(); }, [preferences.district]);

    const fetchSchemes = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/v1/schemes`, { params: { district: preferences.district } });
            setSchemes(res.data);
            setLoading(false);
        } catch (err) { console.error(err); setLoading(false); }
    };

    const toggleExpand = (id) => { setExpandedSchemeId(expandedSchemeId === id ? null : id); };

    const filteredSchemes = schemes.filter(s => {
        const matchesTab = s.type === activeTab;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = s.title.en.toLowerCase().includes(searchLower) || s.title.mr?.includes(searchTerm) || s.details.benefits?.toLowerCase().includes(searchLower);
        return matchesTab && matchesSearch;
    });

    const tabs = [
        { key: 'STATE', labelKey: 'schemes.state', color: 'green' },
        { key: 'CENTRAL', labelKey: 'schemes.central', color: 'blue' },
    ];

    // Helper to pick title based on language
    const localize = (obj) => obj?.[lang] || obj?.mr || obj?.en || '';

    return (
        <div className="container mx-auto px-4 py-6 mb-20 animate-fadeInUp">
            <h2 className="text-2xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center"><ClipboardList className="w-5 h-5 text-blue-600" /></div>
                {t('schemes.title')}
            </h2>

            <div className="flex gap-2 mb-5">
                {tabs.map(tab => (
                    <button key={tab.key} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${activeTab === tab.key ? (tab.color === 'green' ? 'bg-green-600 text-white shadow-md' : 'bg-blue-600 text-white shadow-md') : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`} onClick={() => setActiveTab(tab.key)}>
                        {t(tab.labelKey)}
                    </button>
                ))}
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input type="text" placeholder={t('schemes.search')} className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="spinner w-10 h-10 border-[3px] border-green-200 border-t-green-600" />
                    <p className="text-gray-400 mt-4 text-sm">{t('schemes.loading')}</p>
                </div>
            ) : filteredSchemes.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-400 text-base">{t('schemes.noResults')}</p>
                    <button onClick={() => setSearchTerm('')} className="mt-3 text-green-600 font-bold hover:underline text-sm">{t('schemes.clearSearch')}</button>
                </div>
            ) : (
                <div className="grid gap-4 stagger-children">
                    {filteredSchemes.map(scheme => (
                        <div key={scheme._id} className="animate-fadeInUp bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
                            <div onClick={() => toggleExpand(scheme._id)} className="p-5 cursor-pointer hover:bg-gray-50/50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-green-100 text-green-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">{scheme.category || 'General'}</span>
                                            {scheme.details.lastDate && new Date(scheme.details.lastDate) > new Date() && (
                                                <span className="bg-red-50 text-red-600 text-[10px] px-2.5 py-0.5 rounded-full font-bold animate-pulse">Closing Soon</span>
                                            )}
                                        </div>
                                        <h3 className="text-base font-bold text-gray-900 leading-tight">{localize(scheme.title)}</h3>
                                    </div>
                                    <div className="ml-3 mt-1 text-gray-300">
                                        {expandedSchemeId === scheme._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                    <span className="font-semibold text-green-600">{t('schemes.benefit')}</span> {scheme.details.benefits}
                                </p>
                                <div className="flex justify-between items-center text-xs text-gray-400 mt-3 pt-3 border-t border-gray-50">
                                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{scheme.details.lastDate ? new Date(scheme.details.lastDate).toLocaleDateString() : t('schemes.ongoing')}</span>
                                    <span className="text-green-600 font-semibold">{expandedSchemeId === scheme._id ? t('schemes.close') : t('schemes.readMore')}</span>
                                </div>
                            </div>

                            {expandedSchemeId === scheme._id && (
                                <div className="bg-gray-50/50 p-5 border-t border-gray-100 text-sm animate-fadeInUp">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="bg-white p-4 rounded-xl border border-gray-100">
                                            <h4 className="font-bold text-green-700 mb-2 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" />{t('schemes.eligibility')}</h4>
                                            <p className="text-gray-600 whitespace-pre-line leading-relaxed">{scheme.details.eligibility}</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-gray-100">
                                            <h4 className="font-bold text-blue-700 mb-2 flex items-center gap-1.5"><FileText className="w-4 h-4" />{t('schemes.documents')}</h4>
                                            <ul className="list-disc list-inside text-gray-600 space-y-1">{scheme.details.documents.map((doc, idx) => (<li key={idx} className="leading-snug">{doc}</li>))}</ul>
                                        </div>
                                    </div>
                                    <div className="mt-4 bg-white p-4 rounded-xl border border-gray-100">
                                        <h4 className="font-bold text-gray-800 mb-2">{t('schemes.process')}</h4>
                                        <p className="text-gray-600 mb-4 leading-relaxed">{scheme.details.applicationProcess}</p>
                                        <div className="flex flex-wrap gap-3">
                                            <a href={scheme.officialSourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition shadow-sm active:scale-95">
                                                <ExternalLink className="w-4 h-4" />{t('schemes.applyOnline')}
                                            </a>
                                            {scheme.details.offlineMode && (
                                                <span className="flex items-center gap-2 bg-orange-50 text-orange-700 px-5 py-2.5 rounded-xl font-bold border border-orange-200"><MapPin className="w-4 h-4" />{t('schemes.visitCenter')}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Schemes;
