import { useContext } from 'react';
import UserContext from '../context/UserContext';

const Header = () => {
    const { preferences, updatePreference } = useContext(UserContext);

    return (
        <header className="bg-green-700 text-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-2 md:py-2.5 flex justify-between items-center max-w-7xl h-14 md:h-16">
                <div className="flex items-center space-x-2 md:space-x-8 h-full">
                    <div className="flex items-center space-x-2">
                        {/* Logo Placeholder */}
                        <div className="w-8 h-8 md:w-9 md:h-9 bg-white rounded-full flex items-center justify-center text-green-700 font-bold text-xl cursor-pointer shadow-sm">
                            F
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold tracking-wide hidden xs:block">Farmiq</h1>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-6 h-full items-center">
                        <a href="/" className="hover:text-green-200 font-medium transition-colors text-sm lg:text-base">मुख्य पान</a>
                        <a href="/crops" className="hover:text-green-200 font-medium transition-colors text-sm lg:text-base">पीक सल्ला</a>
                        <a href="/calendar" className="hover:text-green-200 font-medium transition-colors text-sm lg:text-base">दिनदर्शिका</a>
                        <a href="/schemes" className="hover:text-green-200 font-medium transition-colors text-sm lg:text-base">योजना</a>
                        <a href="/officers" className="hover:text-green-200 font-medium transition-colors text-sm lg:text-base">संपर्क</a>
                    </nav>
                </div>

                <div>
                    <select
                        className="bg-green-800 text-white text-xs md:text-sm rounded-lg border border-green-600 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500 cursor-pointer hover:bg-green-750 transition-colors"
                        value={preferences.language}
                        onChange={(e) => updatePreference('language', e.target.value)}
                    >
                        <option value="mr">मराठी</option>
                        <option value="en">English</option>
                        <option value="hi">हिंदी</option>
                    </select>
                </div>
            </div>
        </header>
    );
};

export default Header;
