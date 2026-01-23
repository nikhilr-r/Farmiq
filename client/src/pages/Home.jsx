import { useContext } from 'react';
import { Link } from 'react-router-dom';
import UserContext from '../context/UserContext';
import { MAHARASHTRA_DISTRICTS } from '../constants';
import WeatherCard from '../components/WeatherCard';

const Home = () => {
    const { preferences, updatePreference } = useContext(UserContext);

    const districts = MAHARASHTRA_DISTRICTS;

    return (
        <div className="flex flex-col min-h-screen bg-green-50 pb-20">
            {/* 1. Header Section (Greeting & District) */}
            <header className="bg-green-700 text-white rounded-b-3xl shadow-lg px-6 pt-10 pb-8 relative overflow-hidden">
                {/* Background Pattern (Optional subtle overlay) */}
                <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                    <span className="text-9xl">🌾</span>
                </div>

                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-1">राम राम, शेतकरी दादा! 🙏</h2>
                    <p className="text-green-100 text-lg mb-6">तुमच्या शेतीचा विश्वासू जोडीदार.</p>
                </div>
            </header>

            {/* 2. Main Features (Vertical Stack for Mobile) */}
            <main className="flex-grow container mx-auto px-4 py-6 space-y-4">

                {/* Weather Card - Automated Location */}
                <WeatherCard />

                {/* Card 1: Govt Schemes */}
                <Link to="/schemes" className="block">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 active:scale-95 transition-transform">
                        <div className="bg-blue-100 p-3 rounded-full text-2xl">🏛️</div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800">शासकीय योजना</h3>
                            <p className="text-gray-500 text-sm">अनुदान, कर्जमाफी आणि विमा माहिती.</p>
                        </div>
                        <div className="text-gray-300">➜</div>
                    </div>
                </Link>

                {/* Card 2: Crop Advice */}
                <Link to="/crops" className="block">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 active:scale-95 transition-transform">
                        <div className="bg-green-100 p-3 rounded-full text-2xl">🌾</div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800">पीक सल्ला</h3>
                            <p className="text-gray-500 text-sm">पेरणी ते काढणी संपूर्ण मार्गदर्शन.</p>
                        </div>
                        <div className="text-gray-300">➜</div>
                    </div>
                </Link>

                {/* Card 3: Calendar */}
                <Link to="/calendar" className="block">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 active:scale-95 transition-transform">
                        <div className="bg-purple-100 p-3 rounded-full text-2xl">📅</div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800">पीक दिनदर्शिका</h3>
                            <p className="text-gray-500 text-sm">आज काय करायचे आहे? वेळापत्रक पहा.</p>
                        </div>
                        <div className="text-gray-300">➜</div>
                    </div>
                </Link>

                {/* Card 4: Officers */}
                <Link to="/officers" className="block">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 active:scale-95 transition-transform">
                        <div className="bg-orange-100 p-3 rounded-full text-2xl">📞</div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800">कृषी अधिकारी</h3>
                            <p className="text-gray-500 text-sm">तुमच्या विभागातील अधिकाऱ्यांचे नंबर.</p>
                        </div>
                        <div className="text-gray-300">➜</div>
                    </div>
                </Link>

                {/* 3. Updates Section (Alert) */}
                <div className="mt-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                        <span className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                        महत्वाच्या बातम्या (Updates)
                    </h3>
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl shadow-sm">
                        <p className="text-base text-gray-800 font-medium leading-relaxed">
                            ℹ️ <span className="font-bold">PM-KISAN:</span> पुढील हप्ता लवकरच जमा होणार आहे. आपली e-KYC पूर्ण करून घ्या.
                        </p>
                        <button className="mt-2 text-blue-700 font-bold text-sm uppercase tracking-wide">सविस्तर वाचा</button>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default Home;
