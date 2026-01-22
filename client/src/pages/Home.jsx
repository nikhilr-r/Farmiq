import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';
import { MAHARASHTRA_DISTRICTS } from '../constants';

const Home = () => {
    const { userProfile, updateUserProfile } = useUser();

    const districts = MAHARASHTRA_DISTRICTS;

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero / Context Section */}
            <section className="bg-green-600 text-white px-4 py-8 rounded-b-3xl shadow-lg">
                <h2 className="text-2xl font-bold mb-2">नमस्कार, {userProfile.name || 'शेतकरी मित्र'}! 🙏</h2>
                <p className="text-green-100 mb-6">Select your district to see relevant info.</p>

                <div className="bg-white rounded-lg p-3 text-gray-800 shadow-md">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Your District (जिल्हा)</label>
                    <select
                        className="w-full text-lg font-semibold bg-transparent focus:outline-none"
                        value={userProfile.district}
                        onChange={(e) => updateUserProfile({ district: e.target.value })}
                    >
                        <option value="">Select District</option>
                        {districts.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>
            </section>

            {/* Main Features Grid */}
            <main className="flex-grow container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Govt Schemes */}
                    <Link to="/schemes">
                        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-shadow cursor-pointer h-full">
                            <h3 className="text-lg font-bold text-gray-800 mb-1">🏛️ Govt Schemes</h3>
                            <p className="text-sm text-gray-500">State & Central subsidies, loans & insurance.</p>
                        </div>
                    </Link>

                    {/* Crop Knowledge */}
                    <Link to="/crops">
                        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 hover:shadow-lg transition-shadow cursor-pointer h-full">
                            <h3 className="text-lg font-bold text-gray-800 mb-1">🌾 Crop Advice</h3>
                            <p className="text-sm text-gray-500">Sowing to Harvest guide for Maharashtra crops.</p>
                        </div>
                    </Link>

                    {/* Officer Directory */}
                    <Link to="/officers">
                        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500 hover:shadow-lg transition-shadow cursor-pointer h-full">
                            <h3 className="text-lg font-bold text-gray-800 mb-1">📞 Agri Officers</h3>
                            <p className="text-sm text-gray-500">Find contact numbers of your local officers.</p>
                        </div>
                    </Link>

                    {/* Calendar / Tasks */}
                    <Link to="/calendar">
                        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500 hover:shadow-lg transition-shadow cursor-pointer h-full">
                            <h3 className="text-lg font-bold text-gray-800 mb-1">📅 Kab Kya Karna Hai?</h3>
                            <p className="text-sm text-gray-500">Farming calendar & deadliness.</p>
                        </div>
                    </Link>
                </div>

                {/* Verified Updates Ticker */}
                <div className="mt-8">
                    <h3 className="text-md font-bold text-gray-700 mb-3 flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                        Latest Verified Updates
                    </h3>
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                        <p className="text-sm text-gray-700">
                            ℹ️ PM-Kisan installment date announced... <span className="text-blue-600 underline">Read More</span>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;
