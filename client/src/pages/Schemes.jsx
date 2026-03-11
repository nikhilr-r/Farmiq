import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE from '../config/api';
import UserContext from '../context/UserContext';

// Removed Lucide imports to rely on standard emojis/CSS where possible for stability.


const Schemes = () => {
    const { preferences } = useContext(UserContext);
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('STATE'); // STATE | CENTRAL
    const [expandedSchemeId, setExpandedSchemeId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSchemes();
    }, [preferences.district]);

    const fetchSchemes = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/v1/schemes`, {
                params: { district: preferences.district }
            });
            setSchemes(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const toggleExpand = (id) => {
        setExpandedSchemeId(expandedSchemeId === id ? null : id);
    };

    const filteredSchemes = schemes.filter(s => {
        const matchesTab = s.type === activeTab;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = s.title.en.toLowerCase().includes(searchLower) ||
            s.title.mr?.includes(searchTerm) ||
            s.details.benefits?.toLowerCase().includes(searchLower);
        return matchesTab && matchesSearch;
    });

    return (
        <div className="container mx-auto px-4 py-6 mb-20">
            <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
                🏛️ Government Schemes
            </h2>

            {/* Tabs */}
            <div className="flex space-x-2 mb-6 border-b border-gray-200">
                <button
                    className={`pb-2 px-4 font-semibold ${activeTab === 'STATE' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('STATE')}
                >
                    Maharashtra State
                </button>
                <button
                    className={`pb-2 px-4 font-semibold ${activeTab === 'CENTRAL' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('CENTRAL')}
                >
                    Central Govt
                </button>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                <input
                    type="text"
                    placeholder="🔍 योजना शोधा (Search Scheme)..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
                    <p className="text-gray-500 mt-4">Loading schemes...</p>
                </div>
            ) : filteredSchemes.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-lg shadow border border-gray-100">
                    <p className="text-gray-500 text-lg">No schemes found matching your search.</p>
                    <button
                        onClick={() => setSearchTerm('')}
                        className="mt-2 text-green-600 font-bold hover:underline"
                    >
                        Clear Search
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredSchemes.map(scheme => (
                        <div key={scheme._id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-200">

                            {/* Card Header (Click to Expand) */}
                            <div
                                onClick={() => toggleExpand(scheme._id)}
                                className="p-5 cursor-pointer hover:bg-green-50/30 transition-colors"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wide">
                                                {scheme.category || 'General'}
                                            </span>
                                            {scheme.details.lastDate && new Date(scheme.details.lastDate) > new Date() && (
                                                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                                                    Closing Soon
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                            {scheme.title.mr || scheme.title.en}
                                        </h3>
                                    </div>
                                    <span className="text-gray-400 ml-3 transform transition-transform duration-200">
                                        {expandedSchemeId === scheme._id ? '🔼' : '🔽'}
                                    </span>
                                </div>

                                {/* Brief Summary */}
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                    <span className="font-semibold text-green-700">Labh (Benefits):</span> {scheme.details.benefits}
                                </p>

                                <div className="flex justify-between items-center text-xs text-gray-500 mt-4 border-t border-gray-100 pt-3">
                                    <span>📅 Valid till: <span className={`font-bold ${scheme.details.lastDate ? 'text-red-500' : 'text-green-600'}`}>{scheme.details.lastDate ? new Date(scheme.details.lastDate).toLocaleDateString() : 'Ongoing (नेहमी सुरू)'}</span></span>
                                    <span className="text-blue-600 font-semibold hover:underline">
                                        {expandedSchemeId === scheme._id ? 'Close Details' : 'Read More'}
                                    </span>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedSchemeId === scheme._id && (
                                <div className="bg-gray-50 p-5 border-t border-gray-200 text-sm">

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                            <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                                                ✅ Eligibility (पात्रता)
                                            </h4>
                                            <p className="text-gray-700 whitespace-pre-line leading-relaxed">{scheme.details.eligibility}</p>
                                        </div>

                                        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                            <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                                📄 Documents (कागदपत्रे)
                                            </h4>
                                            <ul className="list-disc list-inside text-gray-700 space-y-1">
                                                {scheme.details.documents.map((doc, idx) => (
                                                    <li key={idx} className="leading-snug">{doc}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="mt-4 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                        <h4 className="font-bold text-gray-800 mb-2">📝 Application Process (अर्ज प्रक्रिया)</h4>
                                        <p className="text-gray-700 mb-4 leading-relaxed">{scheme.details.applicationProcess}</p>

                                        <div className="flex flex-wrap gap-3">
                                            <a
                                                href={scheme.officialSourceUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition shadow-sm inline-flex items-center gap-2"
                                            >
                                                Apply Online 🔗
                                            </a>
                                            {scheme.details.offlineMode && (
                                                <span className="bg-orange-100 text-orange-800 px-5 py-2.5 rounded-lg font-bold border border-orange-200 inline-flex items-center">
                                                    📍 Visit Seva Kendra
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-3 truncate">Source: {scheme.officialSourceUrl}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Schemes;
