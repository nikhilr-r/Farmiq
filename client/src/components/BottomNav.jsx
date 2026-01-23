import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
    const location = useLocation();

    // Helper to check active state
    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/', label: 'मुख्य पान', icon: '🏠' },
        { path: '/crops', label: 'पीक सल्ला', icon: '🌾' },
        { path: '/calendar', label: 'दिनदर्शिका', icon: '📅' },
        { path: '/schemes', label: 'योजना', icon: '💸' },
        { path: '/officers', label: 'संपर्क', icon: '📞' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 rounded-t-2xl pb-safe">
            <div className="flex justify-around items-center pt-2 pb-3">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex flex-col items-center justify-center w-full py-1 ${isActive(item.path) ? 'text-green-700' : 'text-gray-400'}`}
                    >
                        <span className={`text-2xl mb-1 ${isActive(item.path) ? 'transform scale-110 transition-transform' : ''}`}>
                            {item.icon}
                        </span>
                        <span className={`text-xs font-medium ${isActive(item.path) ? 'font-bold' : ''}`}>
                            {item.label}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default BottomNav;
