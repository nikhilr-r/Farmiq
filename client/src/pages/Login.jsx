import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../config/api';
import UserContext from '../context/UserContext';
import useTranslation from '../i18n/useTranslation';
import { Leaf, Phone, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
    const { loginFarmer } = useContext(UserContext);
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ phone: '', password: '' });
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
            const res = await axios.post(`${API_BASE}/api/v1/farmer/auth/login`, formData);
            loginFarmer(res.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed. Please check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-fadeInUp">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="h-16 w-16 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg">
                        <Leaf className="h-8 w-8 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{t('login.title')}</h2>
                <p className="mt-2 text-center text-sm text-gray-500">{t('login.welcome')}</p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
                <div className="bg-white py-8 px-5 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-fadeInUp">
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-2">
                                <Phone className="w-4 h-4 text-green-600" />
                                {t('login.phone')}
                            </label>
                            <input type="tel" name="phone" required pattern="[6-9][0-9]{9}" placeholder="9876543210" value={formData.phone} onChange={handleChange} className="block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 text-base focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder:text-gray-300" />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-2">
                                <Lock className="w-4 h-4 text-green-600" />
                                {t('login.password')}
                            </label>
                            <input type="password" name="password" required value={formData.password} onChange={handleChange} className="block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 text-base focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder:text-gray-300" />
                        </div>
                        <div className="flex items-center justify-end">
                            <Link to="#" className="text-sm font-medium text-green-600 hover:text-green-500 transition-colors">{t('login.forgot')}</Link>
                        </div>
                        <button type="submit" disabled={loading} className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                            {loading ? (<><span className="spinner" />{t('login.loading')}</>) : (<>{t('login.submit')}<ArrowRight className="w-5 h-5" /></>)}
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-gray-100 pt-6">
                        <p className="text-sm text-gray-500">
                            {t('login.newUser')}{' '}
                            <Link to="/register" className="font-bold text-green-600 hover:text-green-500 transition-colors">{t('login.registerLink')}</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
