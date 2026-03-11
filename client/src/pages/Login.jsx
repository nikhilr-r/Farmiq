import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserContext from '../context/UserContext';
import { Leaf, Phone, Lock } from 'lucide-react';

const Login = () => {
    const { loginFarmer } = useContext(UserContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        phone: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:5000/api/v1/farmer/auth/login', formData);

            // On success, save token to context/storage and redirect to dashboard
            loginFarmer(res.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed. Please check credentials.');
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
                    लॉगिन (Login)
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Farmiq मध्ये आपले स्वागत आहे!
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-green-100">

                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 flex items-center mb-1">
                                <Phone className="w-4 h-4 mr-1 text-green-700" /> मोबाईल नंबर (Phone)
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                pattern="[6-9][0-9]{9}"
                                placeholder="9876543210"
                                value={formData.phone}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 flex items-center mb-1">
                                <Lock className="w-4 h-4 mr-1 text-green-700" /> पासवर्ड (Password)
                            </label>
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-lg"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <a href="#" className="font-medium text-green-600 hover:text-green-500">
                                    पासवर्ड विसरलात? (Forgot Password?)
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-3 px-4 outline-none border border-transparent rounded-lg shadow-sm text-lg font-bold text-white bg-green-600 hover:bg-green-700 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'लॉगिन करत आहे...' : 'लॉगिन (Login)'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center border-t border-gray-200 pt-6">
                        <p className="text-sm text-gray-600">
                            नवीन शेतकरी आहात? <a href="/register" className="font-medium text-green-600 hover:text-green-500">नोंदणी करा (Register)</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
