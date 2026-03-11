import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserContext from '../context/UserContext';
import { MAHARASHTRA_DISTRICTS } from '../constants';
import WeatherCard from '../components/WeatherCard';

const Home = () => {
    const { preferences, updatePreference, isAuthenticated, farmer } = useContext(UserContext);
    const navigate = useNavigate();

    const districts = MAHARASHTRA_DISTRICTS;

    return (
        <div className="flex flex-col min-h-screen bg-green-50/50 pb-24 md:pb-10">
            <div className="container mx-auto px-4 md:px-0 pt-4 md:pt-8 w-full max-w-full">

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start">

                    {/* LEFT COLUMN: Main Content (Greeting, Weather, Actions) */}
                    <div className={`col-span-1 ${isAuthenticated ? 'md:col-span-8' : 'md:col-span-12'} flex flex-col gap-8`}>

                        {/* 1. Greeting Section */}
                        <section className="bg-green-600 md:bg-green-700 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-lg md:shadow-md md:rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between transition-transform hover:scale-[1.005] duration-300">
                            <div className="relative z-10">
                                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                                    {isAuthenticated ? `राम राम, ${farmer?.name?.split(' ')[0] || 'शेतकरी'} दादा! 🙏` : 'Farmiq मध्ये आपले स्वागत आहे! 🙏'}
                                </h2>
                                <p className="text-green-100 text-base md:text-lg">
                                    {isAuthenticated ? 'तुमच्या शेतीचा विश्वासू जोडीदार.' : 'शेतीविषयक सर्व माहिती आणि योजनांसाठी आजच लॉगिन किंवा नोंदणी करा.'}
                                </p>
                                {!isAuthenticated && (
                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <button onClick={() => navigate('/login')} className="bg-white text-green-700 px-5 py-2.5 rounded-lg font-bold shadow-sm hover:bg-green-50 transition-colors">लॉगिन (Login)</button>
                                        <button onClick={() => navigate('/register')} className="bg-green-800 text-white px-5 py-2.5 rounded-lg font-bold border border-green-600 hover:bg-green-900 transition-colors">नवीन नोंदणी (Register)</button>
                                    </div>
                                )}
                            </div>
                            {/* Decorative Icon for Desktop (Reduced Opacity) */}
                            <div className="hidden md:block opacity-10 transform scale-150 rotate-12 pointer-events-none">
                                <span className="text-8xl">🚜</span>
                            </div>
                            {/* Decorative Pattern for Mobile */}
                            <div className="absolute top-0 right-0 opacity-10 pointer-events-none md:hidden">
                                <span className="text-9xl">🌾</span>
                            </div>
                        </section>

                        {/* 2. Weather Card */}
                        {isAuthenticated && (
                            <section>
                                <WeatherCard />
                            </section>
                        )}

                        {/* 3. Action Cards Services */}
                        <section>
                            <h3 className="text-xl font-bold text-gray-800 mb-5 px-1 flex items-center gap-2">
                                <span>🛠️</span> {isAuthenticated ? 'सेवा (Services)' : 'सार्वजनिक सेवा (Public Services)'}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Card 1: Govt Schemes */}
                                <Link to="/schemes" className="block h-full cursor-pointer hover:-translate-y-1 transition-transform duration-300">
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg h-full flex flex-row items-center space-x-4">
                                        <div className="bg-blue-100 p-3.5 rounded-full text-2xl flex-shrink-0">🏛️</div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-800">शासकीय योजना</h3>
                                            <p className="text-gray-500 text-sm mt-0.5">अनुदान, कर्जमाफी आणि विमा माहिती.</p>
                                        </div>
                                        <div className="text-gray-300">➜</div>
                                    </div>
                                </Link>

                                {/* Card 2: Crop Advice */}
                                {isAuthenticated && (
                                    <Link to="/crops" className="block h-full cursor-pointer hover:-translate-y-1 transition-transform duration-300">
                                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg h-full flex flex-row items-center space-x-4">
                                            <div className="bg-green-100 p-3.5 rounded-full text-2xl flex-shrink-0">🌾</div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-800">पीक सल्ला</h3>
                                                <p className="text-gray-500 text-sm mt-0.5">पेरणी ते काढणी संपूर्ण मार्गदर्शन.</p>
                                            </div>
                                            <div className="text-gray-300">➜</div>
                                        </div>
                                    </Link>
                                )}

                                {/* Card 3: Calendar */}
                                {isAuthenticated && (
                                    <Link to="/calendar" className="block h-full cursor-pointer hover:-translate-y-1 transition-transform duration-300">
                                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg h-full flex flex-row items-center space-x-4">
                                            <div className="bg-purple-100 p-3.5 rounded-full text-2xl flex-shrink-0">📅</div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-800">पीक दिनदर्शिका</h3>
                                                <p className="text-gray-500 text-sm mt-0.5">आजचे काम आणि वेळापत्रक.</p>
                                            </div>
                                            <div className="text-gray-300">➜</div>
                                        </div>
                                    </Link>
                                )}

                                {/* Card 4: Officers */}
                                <Link to="/officers" className="block h-full cursor-pointer hover:-translate-y-1 transition-transform duration-300">
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg h-full flex flex-row items-center space-x-4">
                                        <div className="bg-orange-100 p-3.5 rounded-full text-2xl flex-shrink-0">📞</div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-800">कृषी अधिकारी</h3>
                                            <p className="text-gray-500 text-sm mt-0.5">तुमच्या विभागातील संपर्क.</p>
                                        </div>
                                        <div className="text-gray-300">➜</div>
                                    </div>
                                </Link>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN: Updates / Notifications */}
                    {isAuthenticated && (
                        <aside className="col-span-1 md:col-span-4 space-y-8 md:sticky md:top-24">

                            {/* Updates Block */}
                            <div className="bg-white md:bg-transparent rounded-2xl md:rounded-none p-5 md:p-0 shadow-sm md:shadow-none border border-gray-100 md:border-none">
                                <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center">
                                    <span className="relative flex h-2.5 w-2.5 mr-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                    </span>
                                    महत्वाच्या बातम्या (Updates)
                                </h3>

                                <div className="space-y-4">
                                    {/* Update Item 1 */}
                                    <div className="bg-yellow-50/80 border border-yellow-200/60 p-4 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer">
                                        <p className="text-gray-800 font-medium text-sm leading-relaxed mb-2">
                                            <span className="text-red-600 font-bold">📢 PM-KISAN update:</span> पुढील हप्ता 15 फेब्रुवारीला जमा होणार आहे. e-KYC करून घ्या.
                                        </p>
                                        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">2 तासांपूर्वी</span>
                                    </div>

                                    {/* Update Item 2 (Mockup) */}
                                    <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer block md:hidden lg:block">
                                        <p className="text-gray-800 font-medium text-sm leading-relaxed mb-2">
                                            🦠 <span className="font-bold text-green-700">कापूस पिकावर बोंडअळीचा प्रादुर्भाव</span> वाढण्याची शक्यता. फवारणी वेळापत्रक पहा.
                                        </p>
                                        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">काल</span>
                                    </div>
                                </div>
                            </div>

                            {/* Market Rates Widget (Minimal) */}
                            <div className="hidden md:block bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100/50 text-center shadow-sm">
                                <h4 className="font-bold text-blue-900 mb-2 text-lg">बाजारभाव (Market Rates)</h4>
                                <p className="text-sm text-blue-700/80 mb-4">तुमच्या जवळच्या बाजारसमितीचे भाव पहा.</p>
                                <span className="inline-block bg-white text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm border border-blue-100">
                                    🚧 लवकरच येत आहे (Coming Soon)
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
