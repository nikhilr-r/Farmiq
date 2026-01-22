import { useUser } from '../context/UserContext';

const Header = () => {
    const { userProfile, updateUserProfile } = useUser();

    return (
        <header className="bg-green-700 text-white shadow-md">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    {/* Logo Placeholder */}
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-green-700 font-bold">
                        F
                    </div>
                    <h1 className="text-xl font-bold tracking-wide">Farmiq</h1>
                </div>

                <div>
                    <select
                        className="bg-green-800 text-white text-sm rounded border border-green-600 px-2 py-1 focus:outline-none"
                        value={userProfile.language || 'mr'}
                        onChange={(e) => updateUserProfile({ language: e.target.value })}
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
