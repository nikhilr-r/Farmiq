import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE from '../config/api';
import UserContext from '../context/UserContext';
import useTranslation from '../i18n/useTranslation';
import { MAHARASHTRA_DISTRICTS, DISTRICT_TALUKAS } from '../constants';
import { Search, MapPin, Phone, Mail, Clock, ChevronDown, Users } from 'lucide-react';

const Officers = () => {
    const { preferences } = useContext(UserContext);
    const { t } = useTranslation();
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ district: preferences.district || '', taluka: '' });

    const districts = MAHARASHTRA_DISTRICTS;
    const [availableTalukas, setAvailableTalukas] = useState([]);

    useEffect(() => {
        if (filters.district) { setAvailableTalukas(DISTRICT_TALUKAS[filters.district] || []); } else { setAvailableTalukas([]); }
    }, [filters.district]);

    useEffect(() => {
        if (filters.district) { fetchOfficers(); } else { setOfficers([]); }
    }, [filters.district, filters.taluka]);

    const fetchOfficers = async () => {
        setLoading(true);
        try { const res = await axios.get(`${API_BASE}/api/v1/officers`, { params: { district: filters.district, taluka: filters.taluka } }); setOfficers(res.data); }
        catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSearch = (e) => { e.preventDefault(); fetchOfficers(); };
    const selectClasses = "w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white appearance-none";

    return (
        <div className="container mx-auto px-4 py-6 mb-20 animate-fadeInUp">
            <h2 className="text-2xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center"><Users className="w-5 h-5 text-orange-600" /></div>
                {t('officers.title')}
            </h2>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-3">
                    <div className="relative">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">{t('officers.district')}</label>
                        <select className={selectClasses} value={filters.district} onChange={(e) => { setFilters({ ...filters, district: e.target.value, taluka: '' }); }}>
                            <option value="">Select District</option>
                            {districts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 bottom-3 w-4 h-4 text-gray-300 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">{t('officers.taluka')}</label>
                        <select className={selectClasses} value={filters.taluka} onChange={(e) => setFilters({ ...filters, taluka: e.target.value })} disabled={!filters.district}>
                            <option value="">{filters.district ? t('officers.selectTaluka') : t('officers.selectDistrictFirst')}</option>
                            {availableTalukas.map(tl => <option key={tl} value={tl}>{tl}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 bottom-3 w-4 h-4 text-gray-300 pointer-events-none" />
                    </div>
                    <div className="flex items-end">
                        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-2.5 px-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm active:scale-95">
                            <Search className="w-4 h-4" />{t('officers.search')}
                        </button>
                    </div>
                </form>
            </div>

            {loading ? (
                <div className="flex flex-col items-center py-16">
                    <div className="spinner w-10 h-10 border-[3px] border-orange-200 border-t-orange-600" />
                    <p className="text-gray-400 mt-4 text-sm">{t('officers.searching')}</p>
                </div>
            ) : officers.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                    {filters.district ? <p className="text-gray-400">{t('officers.noResults')}</p> : <p className="text-gray-400">{t('officers.selectDistrict')}</p>}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 stagger-children">
                    {officers.map(officer => (
                        <div key={officer._id} className="animate-fadeInUp bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                            <div className="flex items-start gap-3">
                                <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"><Users className="w-5 h-5 text-orange-600" /></div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-bold text-gray-900">{officer.name}</h3>
                                    <p className="text-green-600 font-semibold text-sm">{officer.designation}</p>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-50 space-y-2 text-sm">
                                <p className="flex items-center gap-2 text-gray-600"><MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" /><span>{officer.location.taluka ? `${officer.location.taluka}, ` : ''}{officer.location.district}</span></p>
                                <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400 flex-shrink-0" /><a href={`tel:${officer.contact.phone}`} className="text-blue-600 font-medium hover:underline">{officer.contact.phone}</a></p>
                                {officer.contact.email && <p className="flex items-center gap-2 text-gray-600"><Mail className="w-4 h-4 text-gray-400 flex-shrink-0" /><span className="truncate">{officer.contact.email}</span></p>}
                                <p className="text-xs text-gray-400">{officer.contact.officeAddress}</p>
                            </div>
                            <div className="mt-3 pt-2 border-t border-gray-50 flex items-center gap-1.5 text-xs text-gray-400">
                                <Clock className="w-3.5 h-3.5" />{officer.contact.workingHours || '10:00 AM - 5:00 PM'}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Officers;
