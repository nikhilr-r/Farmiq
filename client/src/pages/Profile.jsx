import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE from '../config/api';
import { User, MapPin, Tractor, Sprout, AlertCircle, CheckCircle2, Lock, Save } from 'lucide-react';
import UserContext from '../context/UserContext';
import useTranslation from '../i18n/useTranslation';

const Profile = () => {
    const { farmer, token, loginFarmer } = useContext(UserContext);
    const { t } = useTranslation();
    const [cropsList, setCropsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ type: '', msg: '' });

    const [formData, setFormData] = useState({
        name: '', language: 'mr', district: '', taluka: '', village: '', pincode: '',
        landSize: '', soilType: 'black', irrigationType: 'rainfed', farmingType: 'conventional',
        cropsGrown: [], password: ''
    });

    useEffect(() => { axios.get(`${API_BASE}/api/v1/crops`).then(res => setCropsList(res.data)).catch(err => console.error("Failed to fetch crops", err)); }, []);

    useEffect(() => {
        if (farmer) {
            setFormData({
                name: farmer.name || '', language: farmer.language || 'mr',
                district: farmer.location?.district || '', taluka: farmer.location?.taluka || '',
                village: farmer.location?.village || '', pincode: farmer.location?.pincode || '',
                landSize: farmer.farm?.landSize || '', soilType: farmer.farm?.soilType || 'black',
                irrigationType: farmer.farm?.irrigationType || 'rainfed', farmingType: farmer.farm?.farmingType || 'conventional',
                cropsGrown: farmer.cropsGrown?.map(c => typeof c === 'object' ? c._id : c) || [], password: ''
            });
        }
    }, [farmer]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'cropsGrown') {
            setFormData(prev => {
                const currentCrops = [...prev.cropsGrown];
                if (checked) { currentCrops.push(value); } else { return { ...prev, cropsGrown: currentCrops.filter(id => id !== value) }; }
                return { ...prev, cropsGrown: currentCrops };
            });
        } else { setFormData({ ...formData, [name]: value }); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true); setSubmitStatus({ type: '', msg: '' });
        const updateData = { ...formData }; if (!updateData.password) delete updateData.password;
        try {
            await axios.put(`${API_BASE}/api/v1/farmer/auth/profile`, updateData, { headers: { 'x-auth-token': token } });
            setSubmitStatus({ type: 'success', msg: t('profile.success') });
            setTimeout(() => { loginFarmer(token); setFormData(prev => ({ ...prev, password: '' })); }, 1000);
        } catch (err) { setSubmitStatus({ type: 'error', msg: err.response?.data?.msg || t('common.error') }); }
        finally { setLoading(false); }
    };

    const inputClasses = "w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-4 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all";
    const selectClasses = "w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-4 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white";
    const labelClasses = "block text-sm font-semibold text-gray-700 mb-1.5";

    if (!farmer) return <div className="flex items-center justify-center p-16"><div className="spinner w-10 h-10 border-[3px] border-green-200 border-t-green-600" /></div>;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fadeInUp">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100 px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-sm"><User className="h-6 w-6" /></div>
                        <div><h2 className="text-xl font-bold text-gray-900">{t('profile.title')}</h2><p className="text-sm text-gray-500">{farmer.phone}</p></div>
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    {submitStatus.msg && (
                        <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 animate-fadeInUp ${submitStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                            {submitStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                            <span className="text-sm font-medium">{submitStatus.msg}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                            <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2"><div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center"><User className="w-4 h-4 text-green-600" /></div>{t('profile.personal')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className={labelClasses}>{t('profile.fullName')}</label><input type="text" name="name" required value={formData.name} onChange={handleChange} className={inputClasses} /></div>
                                <div><label className={labelClasses}>{t('profile.language')}</label><select name="language" value={formData.language} onChange={handleChange} className={selectClasses}><option value="mr">मराठी</option><option value="en">English</option><option value="hi">हिंदी</option></select></div>
                                <div className="md:col-span-2"><label className={`${labelClasses} flex items-center gap-1.5`}><Lock className="w-3.5 h-3.5 text-gray-400" />{t('profile.newPassword')}<span className="text-xs text-gray-400 font-normal ml-1">{t('profile.passwordHint')}</span></label><input type="password" name="password" minLength="6" value={formData.password} onChange={handleChange} placeholder="••••••" className={inputClasses} /></div>
                            </div>
                        </div>

                        <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                            <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2"><div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"><MapPin className="w-4 h-4 text-blue-600" /></div>{t('profile.location')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div><label className={labelClasses}>{t('register.district')} *</label><input type="text" name="district" required value={formData.district} onChange={handleChange} className={inputClasses} /></div>
                                <div><label className={labelClasses}>{t('register.taluka')}</label><input type="text" name="taluka" value={formData.taluka} onChange={handleChange} className={inputClasses} /></div>
                                <div><label className={labelClasses}>{t('register.village')}</label><input type="text" name="village" value={formData.village} onChange={handleChange} className={inputClasses} /></div>
                                <div><label className={labelClasses}>{t('register.pincode')}</label><input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className={inputClasses} /></div>
                            </div>
                        </div>

                        <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                            <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2"><div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center"><Tractor className="w-4 h-4 text-amber-600" /></div>{t('profile.farmDetails')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div><label className={labelClasses}>{t('profile.landSize')}</label><input type="number" name="landSize" step="0.1" value={formData.landSize} onChange={handleChange} className={inputClasses} /></div>
                                <div><label className={labelClasses}>{t('profile.soilType')}</label><select name="soilType" value={formData.soilType} onChange={handleChange} className={selectClasses}><option value="black">{t('soil.black')}</option><option value="red">{t('soil.red')}</option><option value="alluvial">{t('soil.alluvial')}</option><option value="laterite">जांभी माती</option><option value="sandy">{t('soil.sandy')}</option></select></div>
                                <div><label className={labelClasses}>{t('profile.irrigation')}</label><select name="irrigationType" value={formData.irrigationType} onChange={handleChange} className={selectClasses}><option value="rainfed">{t('irrigation.rainfed')}</option><option value="drip">{t('irrigation.drip')}</option><option value="sprinkler">{t('irrigation.sprinkler')}</option><option value="flood">{t('irrigation.flood')}</option></select></div>
                                <div><label className={labelClasses}>{t('profile.farmingType')}</label><select name="farmingType" value={formData.farmingType} onChange={handleChange} className={selectClasses}><option value="conventional">{t('farming.conventional')}</option><option value="organic">{t('farming.organic')}</option><option value="mixed">{t('farming.mixed')}</option></select></div>
                            </div>
                        </div>

                        <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                            <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2"><div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center"><Sprout className="w-4 h-4 text-green-600" /></div>{t('profile.cropsGrown')}</h3>
                            <div className="bg-white border border-gray-100 rounded-xl p-4 max-h-48 overflow-y-auto">
                                {cropsList.map(crop => (
                                    <div key={crop._id} className="flex items-center gap-2 mb-2.5 last:mb-0">
                                        <input type="checkbox" id={`crop-${crop._id}`} name="cropsGrown" value={crop._id} checked={formData.cropsGrown.includes(crop._id)} onChange={handleChange} className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer" />
                                        <label htmlFor={`crop-${crop._id}`} className="text-sm text-gray-700 cursor-pointer">{crop.name.mr} ({crop.name.en}) — <span className="text-gray-400 text-xs">{crop.season}</span></label>
                                    </div>
                                ))}
                                {cropsList.length === 0 && <p className="text-gray-400 text-sm">{t('register.cropsLoading')}</p>}
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button type="submit" disabled={loading} className={`flex items-center gap-2 px-8 py-3 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                {loading ? (<><span className="spinner" />{t('profile.saving')}</>) : (<><Save className="w-5 h-5" />{t('profile.save')}</>)}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
