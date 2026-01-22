import { useState } from 'react';

const Calendar = () => {
    const [month, setMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));

    // Mock Data for MVP
    const tasks = [
        { crop: 'Wheat (Rabi)', task: 'Irrigation', description: 'Apply second irrigation 21-25 days after showing (CRI stage).' },
        { crop: 'Gram', task: 'Pest Control', description: 'Check for Pod Borer infestation. Use Pheromone traps.' },
        { crop: 'General', task: 'Insurance', description: 'Last date for Rabi crop insurance application is approaching.' }
    ];

    return (
        <div className="container mx-auto px-4 py-6 mb-20">
            <h2 className="text-2xl font-bold text-green-800 mb-4">📅 Kab Kya Karna Hai?</h2>

            <div className="bg-green-100 p-4 rounded-lg mb-6 flex justify-between items-center">
                <span className="font-bold text-green-800">Current Month:</span>
                <span className="text-xl font-bold text-green-900 bg-white px-3 py-1 rounded shadow">{month}</span>
            </div>

            <div className="space-y-4">
                {tasks.map((t, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl shadow-md border-l-4 border-purple-500">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-gray-800">{t.crop}</h3>
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">{t.task}</span>
                        </div>
                        <p className="text-gray-600 mt-2 text-sm">{t.description}</p>
                    </div>
                ))}
            </div>

            <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-bold text-blue-800 mb-2">Upcoming Deadlines</h3>
                <ul className="list-disc list-inside text-sm text-gray-700">
                    <li>PM Fasal Bima Yojana: 31st Jan</li>
                    <li>KCC Renewal: 15th Feb</li>
                </ul>
            </div>
        </div>
    );
};

export default Calendar;
