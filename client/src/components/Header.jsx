import { useContext, useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import UserContext from '../context/UserContext';
import useTranslation from '../i18n/useTranslation';
import { User, LogOut, Home, Sprout, Microscope, CalendarDays, Landmark, PhoneCall, ChevronDown } from 'lucide-react';

const Header = () => {
    const { preferences, updatePreference, isAuthenticated, farmer, logoutFarmer } = useContext(UserContext);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logoutFarmer();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/', key: 'header.home', icon: Home },
        { path: '/crops', key: 'header.crops', icon: Sprout },
        { path: '/crop-doctor', key: 'header.cropDoctor', icon: Microscope },
        { path: '/calendar', key: 'header.calendar', icon: CalendarDays },
        { path: '/schemes', key: 'header.schemes', icon: Landmark },
        { path: '/officers', key: 'header.officers', icon: PhoneCall },
    ];

    return (
        <header className={`sticky top-0 z-50 transition-all duration-300 ${
            scrolled
                ? 'bg-green-800/95 backdrop-blur-md shadow-lg'
                : 'bg-green-700 shadow-md'
        }`}>
            <div className="container mx-auto px-4 py-2 md:py-2.5 flex justify-between items-center max-w-7xl h-14 md:h-16">
                <div className="flex items-center space-x-2 md:space-x-8 h-full">
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-white to-green-100 rounded-xl flex items-center justify-center text-green-700 font-extrabold text-lg shadow-sm group-hover:scale-105 transition-transform">
                            F
                        </div>
                        <span className="text-lg md:text-xl font-bold tracking-tight text-white hidden xs:block">
                            Farmiq
                        </span>
                    </Link>

                    {isAuthenticated && (
                        <nav className="hidden md:flex space-x-1 h-full items-center">
                            {navLinks.map(({ path, key, icon: Icon }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        isActive(path)
                                            ? 'bg-white/15 text-white shadow-sm'
                                            : 'text-green-100 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" strokeWidth={isActive(path) ? 2.5 : 2} />
                                    <span>{t(key)}</span>
                                </Link>
                            ))}
                        </nav>
                    )}
                </div>

                <div className="flex items-center space-x-3 md:space-x-4">
                    <div className="relative">
                        <select
                            className="appearance-none bg-white/10 text-white text-xs md:text-sm rounded-lg border border-white/20 pl-2.5 pr-7 py-1.5 focus:outline-none focus:ring-1 focus:ring-white/30 cursor-pointer hover:bg-white/15 transition-colors"
                            value={preferences.language}
                            onChange={(e) => updatePreference('language', e.target.value)}
                        >
                            <option value="mr" className="text-gray-900">मराठी</option>
                            <option value="en" className="text-gray-900">English</option>
                            <option value="hi" className="text-gray-900">हिंदी</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/60 pointer-events-none" />
                    </div>

                    {isAuthenticated ? (
                        <div className="flex items-center space-x-2.5">
                            <Link
                                to="/profile"
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-all"
                                title={t('profile.title')}
                            >
                                <div className="w-7 h-7 bg-white/15 rounded-full flex items-center justify-center border border-white/20">
                                    <User className="w-3.5 h-3.5" />
                                </div>
                                <span className="hidden sm:inline-block text-sm">
                                    {farmer?.name?.split(' ')[0]}
                                </span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center w-8 h-8 bg-white/10 hover:bg-red-500/90 rounded-lg transition-all duration-200 border border-white/10 hover:border-red-400/50"
                                title={t('header.logout')}
                            >
                                <LogOut className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 md:px-4 md:py-2 bg-white text-green-700 rounded-lg font-semibold text-xs md:text-sm shadow-sm hover:bg-green-50 hover:shadow-md transition-all active:scale-95"
                        >
                            <User className="w-4 h-4" />
                            <span>{t('header.login')}</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
