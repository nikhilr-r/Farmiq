import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [updates, setUpdates] = useState([]);
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) navigate('/admin/login');
        else fetchUpdates();
    }, []);

    const fetchUpdates = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/v1/admin/updates/pending', {
                headers: { 'x-auth-token': localStorage.getItem('admin_token') }
            });
            setUpdates(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const verifyUpdate = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/v1/admin/updates/${id}/verify`, {}, {
                headers: { 'x-auth-token': localStorage.getItem('admin_token') }
            });
            setMsg('Update Verified and Published!');
            fetchUpdates();
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            console.error(err);
        }
    };

    const triggerFetch = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/v1/admin/updates/fetch', {}, {
                headers: { 'x-auth-token': localStorage.getItem('admin_token') }
            });
            setMsg(res.data.msg);
            setTimeout(() => { setMsg(''); fetchUpdates(); }, 2000);
        } catch (err) {
            console.error(err);
        }
    }

    const logout = () => {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <button onClick={logout} className="text-red-600 underline">Logout</button>
            </div>

            {msg && <div className="bg-green-100 text-green-800 p-3 rounded mb-4">{msg}</div>}

            <div className="flex gap-4 mb-8">
                <button onClick={triggerFetch} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">
                    ⚡ Trigger Auto-Fetch Updates
                </button>
            </div>

            <h2 className="text-xl font-bold mb-4">Pending Verification ({updates.length})</h2>

            {updates.length === 0 ? (
                <p className="text-gray-500">No pending updates.</p>
            ) : (
                <div className="grid gap-4">
                    {updates.map(update => (
                        <div key={update._id} className="bg-white p-4 rounded shadow border border-gray-200">
                            <p className="text-sm text-gray-500 mb-1">Source: {update.source}</p>
                            <h3 className="font-bold text-lg mb-2">{update.originalTitle}</h3>
                            <p className="text-gray-600 mb-4 bg-gray-50 p-2 rounded text-sm font-mono">{update.originalContent}</p>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => verifyUpdate(update._id)}
                                    className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                                >
                                    Verify & Publish
                                </button>
                                <button className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600">
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
