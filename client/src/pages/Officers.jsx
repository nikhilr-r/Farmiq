import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import UserContext from '../context/UserContext';
import { MAHARASHTRA_DISTRICTS, DISTRICT_TALUKAS } from '../constants';

const Officers = () => {
    const { preferences } = useContext(UserContext);
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        district: preferences.district || '',
        taluka: ''
    });

    const districts = MAHARASHTRA_DISTRICTS;
    const [availableTalukas, setAvailableTalukas] = useState([]);

    useEffect(() => {
        if (filters.district) {
            setAvailableTalukas(DISTRICT_TALUKAS[filters.district] || []);
            // Only reset taluka if the current taluka doesn't belong to the new district
            // But usually safer to reset to avoid mismatches
            if (filters.district !== preferences.district) {
                // If context district matches, maybe keep it?
                // For simplicity, let's keep it empty or default when switching district manually
            }
        } else {
            setAvailableTalukas([]);
        }
    }, [filters.district]);

    // Auto-search when filters change
    useEffect(() => {
        if (filters.district) {
            fetchOfficers();
        } else {
            setOfficers([]); // Clear if no district
        }
    }, [filters.district, filters.taluka]);

    const fetchOfficers = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/v1/officers', {
                params: {
                    district: filters.district,
                    taluka: filters.taluka
                }
            });
            setOfficers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchOfficers();
    };

    return (
        <div className="container mx-auto px-4 py-6 mb-20">
            <h2 className="text-2xl font-bold text-green-800 mb-4">📞 Agriculture Officers</h2>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-md mb-6">
                <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">District (जिल्हा)</label>
                        <select
                            className="w-full border rounded p-2"
                            value={filters.district}
                            onChange={(e) => {
                                setFilters({ ...filters, district: e.target.value, taluka: '' });
                            }}
                        >
                            <option value="">Select District</option>
                            {districts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Taluka (तालुका)</label>
                        <select
                            className="w-full border rounded p-2"
                            value={filters.taluka}
                            onChange={(e) => setFilters({ ...filters, taluka: e.target.value })}
                            disabled={!filters.district}
                        >
                            <option value="">{filters.district ? 'Select Taluka (Optional)' : 'Select District First'}</option>
                            {availableTalukas.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button type="submit" className="w-full bg-orange-500 text-white font-bold py-2 px-4 rounded hover:bg-orange-600 transition-colors">
                            Search Officers
                        </button>
                    </div>
                </form>
            </div>

            {/* Results */}
            {loading ? (
                <p className="text-center text-gray-500">Searching directory...</p>
            ) : officers.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-lg shadow">
                    {filters.district ?
                        <p className="text-gray-500">No officers found for this location.</p> :
                        <p className="text-gray-500">Please select a district to view officers.</p>
                    }
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {officers.map(officer => (
                        <div key={officer._id} className="bg-white p-5 rounded-xl shadow border-l-4 border-orange-400">
                            <h3 className="text-lg font-bold text-gray-800">{officer.name}</h3>
                            <p className="text-green-700 font-semibold text-sm">{officer.designation}</p>

                            <div className="mt-3 text-sm text-gray-600 space-y-1">
                                <p>📍 {officer.location.taluka ? `${officer.location.taluka}, ` : ''}{officer.location.district}</p>
                                <p>📞 <a href={`tel:${officer.contact.phone}`} className="text-blue-600 underline">{officer.contact.phone}</a></p>
                                {officer.contact.email && <p>✉️ {officer.contact.email}</p>}
                                <p className="text-xs text-gray-500">{officer.contact.officeAddress}</p>
                            </div>

                            <div className="mt-3 pt-2 border-t text-xs text-gray-500">
                                Work Hours: {officer.contact.workingHours || '10:00 AM - 5:00 PM'}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Officers;
