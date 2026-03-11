import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE from '../config/api';
import { User, MapPin, Tractor, Sprout, AlertCircle, CheckCircle2, Leaf } from 'lucide-react';
import UserContext from '../context/UserContext';

const Profile = () => {
    const { farmer, token, loginFarmer } = useContext(UserContext); // Using loginFarmer to refresh token/user state if needed
    const [cropsList, setCropsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ type: '', msg: '' });

    const [formData, setFormData] = useState({
        name: '',
        language: 'mr',
        district: '',
        taluka: '',
        village: '',
        pincode: '',
        landSize: '',
        soilType: 'black',
        irrigationType: 'rainfed',
        farmingType: 'conventional',
        cropsGrown: [],
        password: ''
    });

    useEffect(() => {
        const fetchCrops = async () => {
            try {
                const res = await axios.get(`${API_BASE}/api/v1/crops`);
                setCropsList(res.data);
            } catch (err) {
                console.error("Failed to fetch crops", err);
            }
        };
        fetchCrops();
    }, []);

    useEffect(() => {
        // Pre-fill form with existing farmer data
        if (farmer) {
            setFormData({
                name: farmer.name || '',
                language: farmer.language || 'mr',
                district: farmer.location?.district || '',
                taluka: farmer.location?.taluka || '',
                village: farmer.location?.village || '',
                pincode: farmer.location?.pincode || '',
                landSize: farmer.farm?.landSize || '',
                soilType: farmer.farm?.soilType || 'black',
                irrigationType: farmer.farm?.irrigationType || 'rainfed',
                farmingType: farmer.farm?.farmingType || 'conventional',
                cropsGrown: farmer.cropsGrown?.map(c => typeof c === 'object' ? c._id : c) || [],
                password: '' // Keep password empty unless they want to change it
            });
        }
    }, [farmer]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'cropsGrown') {
            setFormData(prev => {
                const currentCrops = [...prev.cropsGrown];
                if (checked) {
                    currentCrops.push(value);
                } else {
                    return { ...prev, cropsGrown: currentCrops.filter(id => id !== value) };
                }
                return { ...prev, cropsGrown: currentCrops };
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmitStatus({ type: '', msg: '' });

        // Clone format and remove empty password so it isn't updated
        const updateData = { ...formData };
        if (!updateData.password) {
            delete updateData.password;
        }

        try {
            const res = await axios.put(`${API_BASE}/api/v1/farmer/auth/profile`, updateData, {
                headers: { 'x-auth-token': token }
            });

            setSubmitStatus({ type: 'success', msg: 'प्रोफाईल यशस्वीरित्या अद्यतनित केले! (Profile updated successfully!)' });

            // Re-authenticate/reload context to get newest populated state
            setTimeout(() => {
                loginFarmer(token);
                // Clear password field after save
                setFormData(prev => ({ ...prev, password: '' }));
            }, 1000);

        } catch (err) {
            console.error(err);
            setSubmitStatus({
                type: 'error',
                msg: err.response?.data?.msg || 'प्रोफाईल अद्यतनित करण्यात त्रुटी आली. (Error updating profile.)'
            });
        } finally {
            setLoading(false);
        }
    };

    if (!farmer) {
        return <div className="p-10 text-center">Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden">
                {/* Header Header */}
                <div className="bg-green-700/5 border-b border-green-100 px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-700">
                            <User className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">तुमची प्रोफाईल (Your Profile)</h2>
                            <p className="text-sm text-gray-500">{farmer.phone}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    {submitStatus.msg && (
                        <div className={`mb-6 p-4 rounded-lg flex items-center ${submitStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            {submitStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
                            {submitStatus.msg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Section 1: Personal Info */}
                        <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><User className="w-5 h-5 mr-2 text-green-600" /> वैयक्तिक माहिती (Personal Info)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">पूर्ण नाव (Full Name)</label>
                                    <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2.5 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">पसंतीची भाषा (Preferred Language)</label>
                                    <select name="language" value={formData.language} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2.5 border bg-white">
                                        <option value="mr">मराठी</option>
                                        <option value="en">English</option>
                                        <option value="hi">हिंदी</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">नवीन पासवर्ड (New Password) - <span className="text-xs text-gray-500 font-normal">Leave blank to keep current password</span></label>
                                    <input type="password" name="password" minLength="6" value={formData.password} onChange={handleChange} placeholder="नवीन पासवर्ड (New Password)" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2.5 border" />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Location */}
                        <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><MapPin className="w-5 h-5 mr-2 text-green-600" /> ठिकाण (Location)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">जिल्हा (District)*</label>
                                    <input type="text" name="district" required value={formData.district} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2.5 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">तालुका (Taluka)</label>
                                    <input type="text" name="taluka" value={formData.taluka} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2.5 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">गाव (Village)</label>
                                    <input type="text" name="village" value={formData.village} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2.5 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">पिनकोड (Pincode)</label>
                                    <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2.5 border" />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Farm Details */}
                        <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><Tractor className="w-5 h-5 mr-2 text-green-600" /> शेतीचा तपशील (Farm Details)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">क्षेत्र (Land Size, Acres)</label>
                                    <input type="number" name="landSize" step="0.1" value={formData.landSize} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2.5 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">मातीचा प्रकार (Soil Type)</label>
                                    <select name="soilType" value={formData.soilType} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2.5 border bg-white">
                                        <option value="black">काळी माती (Black)</option>
                                        <option value="red">लाल माती (Red)</option>
                                        <option value="alluvial">गाळाची माती (Alluvial)</option>
                                        <option value="laterite">जांभी माती (Laterite)</option>
                                        <option value="sandy">वाळूयुक्त (Sandy)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">सिंचन (Irrigation)</label>
                                    <select name="irrigationType" value={formData.irrigationType} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2.5 border bg-white">
                                        <option value="rainfed">जिरायती / पावसाळी (Rainfed)</option>
                                        <option value="drip">ठिबक (Drip)</option>
                                        <option value="sprinkler">तुषार (Sprinkler)</option>
                                        <option value="flood">प्रवाह (Flood)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">शेतीचा प्रकार (Farming)</label>
                                    <select name="farmingType" value={formData.farmingType} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2.5 border bg-white">
                                        <option value="conventional">पारंपारिक (Conventional)</option>
                                        <option value="organic">सेंद्रिय (Organic)</option>
                                        <option value="mixed">मिश्र (Mixed)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Crops */}
                        <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><Sprout className="w-5 h-5 mr-2 text-green-600" /> पिकवली जाणारी पिके (Crops Grown)</h3>
                            <div className="bg-white border text-sm border-gray-200 rounded-lg p-4 max-h-48 overflow-y-auto w-full">
                                {cropsList.map(crop => (
                                    <div key={crop._id} className="flex items-center mb-2">
                                        <input
                                            type="checkbox"
                                            id={`crop-${crop._id}`}
                                            name="cropsGrown"
                                            value={crop._id}
                                            checked={formData.cropsGrown.includes(crop._id)}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                                        />
                                        <label htmlFor={`crop-${crop._id}`} className="ml-2 block text-gray-800 cursor-pointer w-full">
                                            {crop.name.mr} ({crop.name.en}) - <span className="text-gray-500 text-xs">{crop.season}</span>
                                        </label>
                                    </div>
                                ))}
                                {cropsList.length === 0 && <p className="text-gray-500 text-sm italic">पिके लोड होत आहेत... (Loading crops...)</p>}
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-green-600 hover:bg-green-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'सेव्ह करत आहे...' : 'माहिती सेव्ह करा (Save Changes)'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
