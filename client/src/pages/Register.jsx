import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../config/api';
import UserContext from '../context/UserContext';
import { Leaf, User, Phone, MapPin, Map, Factory, Droplets } from 'lucide-react';

const Register = () => {
    const { loginFarmer } = useContext(UserContext);
    const navigate = useNavigate();
    const [availableCrops, setAvailableCrops] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        language: 'mr',
        district: '',
        taluka: '',
        village: '',
        state: 'Maharashtra',
        pincode: '',
        landSize: '',
        landSizeUnit: 'acres',
        soilType: 'black',
        irrigationType: 'rainfed',
        farmingType: 'conventional',
        cropsGrown: []
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch crops for the multi-select dropdown
    useEffect(() => {
        const fetchCrops = async () => {
            try {
                const res = await axios.get(`${API_BASE}/api/v1/crops`);
                setAvailableCrops(res.data);
            } catch (err) {
                console.error('Failed to load crops data');
            }
        };
        fetchCrops();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCropToggle = (cropId) => {
        setFormData(prev => {
            const isSelected = prev.cropsGrown.includes(cropId);
            if (isSelected) {
                return { ...prev, cropsGrown: prev.cropsGrown.filter(id => id !== cropId) };
            } else {
                return { ...prev, cropsGrown: [...prev.cropsGrown, cropId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.cropsGrown.length === 0) {
            setError('कृपया किमान एक पीक निवडा (Please select at least one crop)');
            setLoading(false);
            return;
        }

        try {
            const payload = {
                ...formData,
                landSize: Number(formData.landSize)
            };

            const res = await axios.post(`${API_BASE}/api/v1/farmer/auth/register`, payload);

            // On success, save token and redirect
            loginFarmer(res.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed. Please check inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="h-16 w-16 bg-green-700 rounded-full flex items-center justify-center shadow-lg">
                        <Leaf className="h-8 w-8 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    शेतकरी नोंदणी
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    तुमच्या शेतीचा खरा जोडीदार
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl px-4">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-green-100">

                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {/* Section 1: Basic Info */}
                        <div>
                            <h3 className="text-lg font-medium leading-6 text-green-800 border-b border-green-100 pb-2 flex items-center">
                                <User className="w-5 h-5 mr-2" /> वैयक्तिक माहिती (Personal Details)
                            </h3>
                            <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">पूर्ण नाव (Full Name)</label>
                                    <input type="text" name="name" required value={formData.name} onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">मोबाईल नंबर (Phone)</label>
                                    <input type="tel" name="phone" required pattern="[6-9][0-9]{9}" placeholder="9876543210" value={formData.phone} onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">पासवर्ड (Password)</label>
                                    <input type="password" name="password" required minLength={6} value={formData.password} onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Location */}
                        <div className="pt-4">
                            <h3 className="text-lg font-medium leading-6 text-green-800 border-b border-green-100 pb-2 flex items-center">
                                <MapPin className="w-5 h-5 mr-2" /> पत्ता (Location)
                            </h3>
                            <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">जिल्हा (District)</label>
                                    <input type="text" name="district" required value={formData.district} onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">तालुका (Taluka)</label>
                                    <input type="text" name="taluka" value={formData.taluka} onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">गाव (Village)</label>
                                    <input type="text" name="village" value={formData.village} onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">पिनकोड (Pincode)</label>
                                    <input type="text" name="pincode" value={formData.pincode} onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Farm Details */}
                        <div className="pt-4">
                            <h3 className="text-lg font-medium leading-6 text-green-800 border-b border-green-100 pb-2 flex items-center">
                                <Map className="w-5 h-5 mr-2" /> शेतीची माहिती (Farm Details)
                            </h3>
                            <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                                <div className="flex space-x-2">
                                    <div className="w-2/3">
                                        <label className="block text-sm font-medium text-gray-700">क्षेत्र (Land Size)</label>
                                        <input type="number" name="landSize" step="0.1" value={formData.landSize} onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                                    </div>
                                    <div className="w-1/3">
                                        <label className="block text-sm font-medium text-gray-700">एकक (Unit)</label>
                                        <select name="landSizeUnit" value={formData.landSizeUnit} onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm">
                                            <option value="acres">Acres</option>
                                            <option value="hectares">Hectares</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">मातीचा प्रकार (Soil Type)</label>
                                    <select name="soilType" value={formData.soilType} onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm">
                                        <option value="black">काळी (Black)</option>
                                        <option value="red">लाल (Red)</option>
                                        <option value="alluvial">गाळाची (Alluvial)</option>
                                        <option value="sandy">वाळूची (Sandy)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 sm:flex items-center">
                                        <Droplets className="w-4 h-4 mr-1 text-blue-500" /> सिंचन (Irrigation)
                                    </label>
                                    <select name="irrigationType" value={formData.irrigationType} onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm">
                                        <option value="rainfed">जिरायती / पावसावर (Rainfed)</option>
                                        <option value="drip">ठिबक (Drip)</option>
                                        <option value="sprinkler">तुषार (Sprinkler)</option>
                                        <option value="flood">प्रवाही (Flood)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 sm:flex items-center">
                                        <Factory className="w-4 h-4 mr-1 text-gray-500" /> शेतीचा प्रकार (Farming Type)
                                    </label>
                                    <select name="farmingType" value={formData.farmingType} onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm">
                                        <option value="conventional">पारंपारिक (Conventional)</option>
                                        <option value="organic">सेंद्रिय (Organic)</option>
                                        <option value="mixed">मिश्र (Mixed)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Crops Selection */}
                        <div className="pt-4">
                            <h3 className="text-lg font-medium leading-6 text-green-800 border-b border-green-100 pb-2 flex items-center">
                                <Leaf className="w-5 h-5 mr-2" /> मुख्य पिके (Crops Grown) <span className="text-red-500 ml-1">*</span>
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 mb-3">तुम्ही कोणती मुख्य पिके घेता ते निवडा (किमान १)</p>

                            {availableCrops.length === 0 ? (
                                <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded">पिके लोड होत आहेत...</div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-md">
                                    {availableCrops.map(crop => (
                                        <label key={crop._id} className={`flex items-center p-2 rounded cursor-pointer border ${formData.cropsGrown.includes(crop._id) ? 'bg-green-50 border-green-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                                checked={formData.cropsGrown.includes(crop._id)}
                                                onChange={() => handleCropToggle(crop._id)}
                                            />
                                            <span className="ml-2 text-sm text-gray-700">
                                                {crop.name.mr} <span className="text-xs text-gray-400">({crop.name.en})</span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-3 px-4 outline-none border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'नोंदणी करत आहे...' : 'नोंदणी करा (Register)'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            आधीपासून खाते आहे? <a href="/login" className="font-medium text-green-600 hover:text-green-500">लॉगिन करा (Login)</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
