import { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import UserContext from '../context/UserContext';
import { User, LogOut } from 'lucide-react';

const Header = () => {
    const { preferences, updatePreference, isAuthenticated, farmer, logoutFarmer } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutFarmer();
        navigate('/login');
    };

    return (
        <header className="bg-green-700 text-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-2 md:py-2.5 flex justify-between items-center max-w-7xl h-14 md:h-16">
                <div className="flex items-center space-x-2 md:space-x-8 h-full">
                    <div className="flex items-center space-x-2">
                        {/* Logo Placeholder */}
                        <div className="w-8 h-8 md:w-9 md:h-9 bg-white rounded-full flex items-center justify-center text-green-700 font-bold text-xl cursor-pointer shadow-sm">
                            F
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold tracking-wide hidden xs:block">Farmiq</h1>
                    </div>

                    {/* Desktop Navigation */}
                    {isAuthenticated && (
                        <nav className="hidden md:flex space-x-6 h-full items-center">
                            <a href="/" className="hover:text-green-200 font-medium transition-colors text-sm lg:text-base">मुख्य पान</a>
                            <a href="/crops" className="hover:text-green-200 font-medium transition-colors text-sm lg:text-base">पीक सल्ला</a>
                            <a href="/crop-doctor" className="hover:text-green-200 font-medium transition-colors text-sm lg:text-base flex items-center gap-1">🔬 रोग निदान</a>
                            <a href="/calendar" className="hover:text-green-200 font-medium transition-colors text-sm lg:text-base">दिनदर्शिका</a>
                            <a href="/schemes" className="hover:text-green-200 font-medium transition-colors text-sm lg:text-base">योजना</a>
                            <a href="/officers" className="hover:text-green-200 font-medium transition-colors text-sm lg:text-base">संपर्क</a>
                        </nav>
                    )}
                </div>

                <div className="flex items-center space-x-3 md:space-x-4">
                    <select
                        className="bg-green-800 text-white text-xs md:text-sm rounded-lg border border-green-600 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500 cursor-pointer hover:bg-green-750 transition-colors"
                        value={preferences.language}
                        onChange={(e) => updatePreference('language', e.target.value)}
                    >
                        <option value="mr">मराठी</option>
                        <option value="en">English</option>
                        <option value="hi">हिंदी</option>
                    </select>

                    {isAuthenticated ? (
                        <div className="flex items-center space-x-3">
                            <Link to="/profile" className="flex items-center text-sm font-medium hover:text-green-200 transition-colors cursor-pointer" title="तुमची प्रोफाईल (Profile)">
                                <User className="w-5 h-5 sm:hidden mr-1" />
                                <span className="hidden sm:inline-block">नमस्कार, {farmer?.name?.split(' ')[0]}</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center p-1.5 md:p-2 bg-green-800 hover:bg-red-600 rounded-full transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="flex items-center px-3 py-1.5 md:px-4 md:py-2 bg-white text-green-700 rounded-md font-medium text-xs md:text-sm shadow-sm hover:bg-green-50 transition-colors"
                        >
                            <User className="w-4 h-4 md:mr-1" />
                            <span className="hidden md:inline-block">लॉगिन</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
