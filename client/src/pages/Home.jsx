import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserContext from '../context/UserContext';
import useTranslation from '../i18n/useTranslation';
import WeatherCard from '../components/WeatherCard';
import { Landmark, Sprout, CalendarDays, PhoneCall, ChevronRight, LogIn, UserPlus, BellRing, TrendingUp, Microscope } from 'lucide-react';

const Home = () => {
    const { isAuthenticated, farmer } = useContext(UserContext);
    const { t } = useTranslation();
    const navigate = useNavigate();

    const serviceCards = [
        { path: '/schemes', labelKey: 'home.schemeTitle', descKey: 'home.schemeDesc', Icon: Landmark, color: 'bg-blue-50', iconColor: 'text-blue-600', show: true },
        { path: '/crops', labelKey: 'home.cropTitle', descKey: 'home.cropDesc', Icon: Sprout, color: 'bg-green-50', iconColor: 'text-green-600', show: isAuthenticated },
        { path: '/crop-doctor', labelKey: 'home.doctorTitle', descKey: 'home.doctorDesc', Icon: Microscope, color: 'bg-purple-50', iconColor: 'text-purple-600', show: isAuthenticated },
        { path: '/calendar', labelKey: 'home.calendarTitle', descKey: 'home.calendarDesc', Icon: CalendarDays, color: 'bg-amber-50', iconColor: 'text-amber-600', show: isAuthenticated },
        { path: '/officers', labelKey: 'home.officerTitle', descKey: 'home.officerDesc', Icon: PhoneCall, color: 'bg-orange-50', iconColor: 'text-orange-600', show: true },
    ];

    return (
        <div className="flex flex-col min-h-screen pb-24 md:pb-10">
            <div className="container mx-auto px-4 md:px-0 pt-4 md:pt-8 w-full max-w-full">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start">
                    <div className={`col-span-1 ${isAuthenticated ? 'md:col-span-8' : 'md:col-span-12'} flex flex-col gap-6`}>

                        {/* Greeting */}
                        <section className="animate-fadeInUp bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-lg flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="relative z-10">
                                <h2 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">
                                    {isAuthenticated
                                        ? t('home.greetingAuth', { name: farmer?.name?.split(' ')[0] || '' })
                                        : t('home.greetingGuest')
                                    }
                                </h2>
                                <p className="text-green-100/90 text-base md:text-lg">
                                    {isAuthenticated ? t('home.subtitleAuth') : t('home.subtitleGuest')}
                                </p>
                                {!isAuthenticated && (
                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <button onClick={() => navigate('/login')} className="flex items-center gap-2 bg-white text-green-700 px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-green-50 transition-all active:scale-95">
                                            <LogIn className="w-4 h-4" />
                                            {t('home.loginBtn')}
                                        </button>
                                        <button onClick={() => navigate('/register')} className="flex items-center gap-2 bg-white/15 text-white px-5 py-2.5 rounded-xl font-bold border border-white/20 hover:bg-white/25 transition-all active:scale-95">
                                            <UserPlus className="w-4 h-4" />
                                            {t('home.registerBtn')}
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="absolute -right-8 -bottom-8 opacity-[0.07] pointer-events-none">
                                <svg width="200" height="200" viewBox="0 0 200 200" fill="white">
                                    <circle cx="100" cy="100" r="90" stroke="white" strokeWidth="2" fill="none" />
                                    <circle cx="100" cy="100" r="60" stroke="white" strokeWidth="2" fill="none" />
                                    <circle cx="100" cy="100" r="30" stroke="white" strokeWidth="2" fill="none" />
                                    <path d="M100 10 L100 190 M10 100 L190 100" stroke="white" strokeWidth="1.5" />
                                </svg>
                            </div>
                        </section>

                        {/* Weather */}
                        {isAuthenticated && (
                            <section className="animate-fadeInUp" style={{ animationDelay: '100ms' }}>
                                <WeatherCard />
                            </section>
                        )}

                        {/* Services */}
                        <section className="animate-fadeInUp" style={{ animationDelay: '150ms' }}>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 px-1 flex items-center gap-2">
                                {isAuthenticated ? t('home.services') : t('home.publicServices')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
                                {serviceCards.filter(c => c.show).map(({ path, labelKey, descKey, Icon, color, iconColor }) => (
                                    <Link key={path} to={path} className="animate-fadeInUp group block cursor-pointer">
                                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100/80 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-4">
                                            <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                                                <Icon className={`w-6 h-6 ${iconColor}`} strokeWidth={1.8} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-base font-bold text-gray-800 leading-tight">{t(labelKey)}</h4>
                                                <p className="text-gray-500 text-sm mt-0.5 truncate">{t(descKey)}</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-green-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column */}
                    {isAuthenticated && (
                        <aside className="col-span-1 md:col-span-4 space-y-6 md:sticky md:top-24 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="relative">
                                        <BellRing className="w-5 h-5 text-red-500" />
                                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
                                    </div>
                                    {t('home.updates')}
                                </h3>
                                <div className="space-y-3">
                                    <div className="bg-amber-50/80 border border-amber-200/50 p-4 rounded-xl hover:shadow-sm transition-all cursor-pointer">
                                        <p className="text-gray-800 font-medium text-sm leading-relaxed mb-2">
                                            <span className="text-red-600 font-bold">📢 PM-KISAN:</span> पुढील हप्ता 15 फेब्रुवारीला जमा होणार आहे. e-KYC करून घ्या.
                                        </p>
                                        <span className="text-xs text-gray-400 font-semibold">2 तासांपूर्वी</span>
                                    </div>
                                    <div className="bg-white border border-gray-100 p-4 rounded-xl hover:shadow-sm transition-all cursor-pointer">
                                        <p className="text-gray-800 font-medium text-sm leading-relaxed mb-2">
                                            <span className="font-bold text-green-700">🦠 कापूस पिकावर बोंडअळीचा प्रादुर्भाव</span> वाढण्याची शक्यता. फवारणी वेळापत्रक पहा.
                                        </p>
                                        <span className="text-xs text-gray-400 font-semibold">काल</span>
                                    </div>
                                </div>
                            </div>

                            <div className="hidden md:block bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100/50 text-center shadow-sm">
                                <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                                <h4 className="font-bold text-blue-900 mb-1 text-base">{t('home.marketRates')}</h4>
                                <p className="text-sm text-blue-600/80 mb-4">{t('home.marketDesc')}</p>
                                <span className="inline-block bg-white text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border border-blue-100">
                                    {t('home.comingSoon')}
                                </span>
                            </div>
                        </aside>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
