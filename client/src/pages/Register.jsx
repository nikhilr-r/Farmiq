import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../config/api';
import UserContext from '../context/UserContext';
import useTranslation from '../i18n/useTranslation';
import { Leaf, User, Phone, MapPin, Map, Factory, Droplets, Lock, ArrowRight } from 'lucide-react';

const Register = () => {
    const { loginFarmer } = useContext(UserContext);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [availableCrops, setAvailableCrops] = useState([]);

    const [formData, setFormData] = useState({
        name: '', phone: '', password: '', language: 'mr',
        district: '', taluka: '', village: '', state: 'Maharashtra', pincode: '',
        landSize: '', landSizeUnit: 'acres', soilType: 'black',
        irrigationType: 'rainfed', farmingType: 'conventional', cropsGrown: []
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCrops = async () => {
            try { const res = await axios.get(`${API_BASE}/api/v1/crops`); setAvailableCrops(res.data); } catch (err) { console.error('Failed to load crops data'); }
        };
        fetchCrops();
    }, []);

    const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

    const handleCropToggle = (cropId) => {
        setFormData(prev => {
            const isSelected = prev.cropsGrown.includes(cropId);
            return isSelected ? { ...prev, cropsGrown: prev.cropsGrown.filter(id => id !== cropId) } : { ...prev, cropsGrown: [...prev.cropsGrown, cropId] };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        if (formData.cropsGrown.length === 0) { setError(t('register.cropsError')); setLoading(false); return; }
        try {
            const payload = { ...formData, landSize: Number(formData.landSize) };
            const res = await axios.post(`${API_BASE}/api/v1/farmer/auth/register`, payload);
            loginFarmer(res.data.token);
            navigate('/');
        } catch (err) { setError(err.response?.data?.msg || 'Registration failed.'); }
        finally { setLoading(false); }
    };

    const inputClasses = "block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-4 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder:text-gray-300";
    const selectClasses = "block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-4 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white";
    const labelClasses = "block text-sm font-semibold text-gray-700 mb-1.5";

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-fadeInUp">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="h-16 w-16 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg">
                        <Leaf className="h-8 w-8 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{t('register.title')}</h2>
                <p className="mt-2 text-center text-sm text-gray-500">{t('register.subtitle')}</p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl px-4">
                <div className="bg-white py-8 px-5 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-fadeInUp">
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    <form className="space-y-8" onSubmit={handleSubmit}>
                        {/* Personal Info */}
                        <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                            <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center"><User className="w-4 h-4 text-green-600" /></div>
                                {t('register.personal')}
                            </h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className={labelClasses}>{t('register.fullName')}</label>
                                    <input type="text" name="name" required value={formData.name} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>{t('register.phone')}</label>
                                    <input type="tel" name="phone" required pattern="[6-9][0-9]{9}" placeholder="9876543210" value={formData.phone} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>{t('register.password')}</label>
                                    <input type="password" name="password" required minLength={6} value={formData.password} onChange={handleChange} className={inputClasses} />
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                            <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"><MapPin className="w-4 h-4 text-blue-600" /></div>
                                {t('register.location')}
                            </h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div><label className={labelClasses}>{t('register.district')}</label><input type="text" name="district" required value={formData.district} onChange={handleChange} className={inputClasses} /></div>
                                <div><label className={labelClasses}>{t('register.taluka')}</label><input type="text" name="taluka" value={formData.taluka} onChange={handleChange} className={inputClasses} /></div>
                                <div><label className={labelClasses}>{t('register.village')}</label><input type="text" name="village" value={formData.village} onChange={handleChange} className={inputClasses} /></div>
                                <div><label className={labelClasses}>{t('register.pincode')}</label><input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className={inputClasses} /></div>
                            </div>
                        </div>

                        {/* Farm Details */}
                        <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                            <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center"><Map className="w-4 h-4 text-amber-600" /></div>
                                {t('register.farmDetails')}
                            </h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="flex gap-2">
                                    <div className="w-2/3"><label className={labelClasses}>{t('register.landSize')}</label><input type="number" name="landSize" step="0.1" value={formData.landSize} onChange={handleChange} className={inputClasses} /></div>
                                    <div className="w-1/3"><label className={labelClasses}>{t('register.unit')}</label><select name="landSizeUnit" value={formData.landSizeUnit} onChange={handleChange} className={selectClasses}><option value="acres">Acres</option><option value="hectares">Hectares</option></select></div>
                                </div>
                                <div><label className={labelClasses}>{t('register.soilType')}</label><select name="soilType" value={formData.soilType} onChange={handleChange} className={selectClasses}><option value="black">{t('soil.black')}</option><option value="red">{t('soil.red')}</option><option value="alluvial">{t('soil.alluvial')}</option><option value="sandy">{t('soil.sandy')}</option></select></div>
                                <div><label className={`${labelClasses} flex items-center gap-1.5`}><Droplets className="w-4 h-4 text-blue-500" />{t('register.irrigation')}</label><select name="irrigationType" value={formData.irrigationType} onChange={handleChange} className={selectClasses}><option value="rainfed">{t('irrigation.rainfed')}</option><option value="drip">{t('irrigation.drip')}</option><option value="sprinkler">{t('irrigation.sprinkler')}</option><option value="flood">{t('irrigation.flood')}</option></select></div>
                                <div><label className={`${labelClasses} flex items-center gap-1.5`}><Factory className="w-4 h-4 text-gray-500" />{t('register.farmingType')}</label><select name="farmingType" value={formData.farmingType} onChange={handleChange} className={selectClasses}><option value="conventional">{t('farming.conventional')}</option><option value="organic">{t('farming.organic')}</option><option value="mixed">{t('farming.mixed')}</option></select></div>
                            </div>
                        </div>

                        {/* Crops */}
                        <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                            <h3 className="text-base font-bold text-gray-800 mb-2 flex items-center gap-2">
                                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center"><Leaf className="w-4 h-4 text-green-600" /></div>
                                {t('register.crops')} <span className="text-red-500">*</span>
                            </h3>
                            <p className="text-xs text-gray-400 mb-3 ml-10">{t('register.cropsHint')}</p>
                            {availableCrops.length === 0 ? (
                                <div className="text-sm text-gray-400 p-4 bg-white rounded-xl border border-gray-100">{t('register.cropsLoading')}</div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-3 bg-white border border-gray-100 rounded-xl">
                                    {availableCrops.map(crop => (
                                        <label key={crop._id} className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer border transition-all text-sm ${formData.cropsGrown.includes(crop._id) ? 'bg-green-50 border-green-300 shadow-sm' : 'bg-white border-gray-100 hover:bg-gray-50'}`}>
                                            <input type="checkbox" className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" checked={formData.cropsGrown.includes(crop._id)} onChange={() => handleCropToggle(crop._id)} />
                                            <span className="text-gray-700">{crop.name.mr} <span className="text-xs text-gray-400">({crop.name.en})</span></span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button type="submit" disabled={loading} className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                            {loading ? (<><span className="spinner" />{t('register.loading')}</>) : (<>{t('register.submit')}<ArrowRight className="w-5 h-5" /></>)}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            {t('register.hasAccount')}{' '}
                            <Link to="/login" className="font-bold text-green-600 hover:text-green-500 transition-colors">{t('register.loginLink')}</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
