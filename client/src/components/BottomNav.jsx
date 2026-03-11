import { useState, useRef, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import UserContext from '../context/UserContext';

const BottomNav = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useContext(UserContext);
    const [scannerOpen, setScannerOpen] = useState(false);
    const [ripple, setRipple] = useState(false);
    const fileInputRef = useRef(null);

    const isActive = (path) => location.pathname === path;

    // Before login: only Schemes & Officers
    const guestNavItems = [
        { path: '/schemes', label: 'योजना', icon: '💸' },
        { path: '/officers', label: 'संपर्क', icon: '📞' },
    ];

    // After login: full nav (scanner goes in center)
    const navItems = [
        { path: '/', label: 'मुख्य पान', icon: '🏠' },
        { path: '/crops', label: 'पीक सल्ला', icon: '🌾' },
        // Scanner button goes in the middle (index 2)
        { path: '/schemes', label: 'योजना', icon: '💸' },
        { path: '/officers', label: 'संपर्क', icon: '📞' },
    ];

    const handleScannerClick = () => {
        setRipple(true);
        setTimeout(() => setRipple(false), 600);

        if (scannerOpen) {
            setScannerOpen(false);
        } else {
            setScannerOpen(true);
        }
    };

    const handleCameraCapture = () => {
        setScannerOpen(false);
        if (fileInputRef.current) {
            fileInputRef.current.setAttribute('capture', 'environment');
            fileInputRef.current.click();
        }
    };

    const handleGalleryUpload = () => {
        setScannerOpen(false);
        if (fileInputRef.current) {
            fileInputRef.current.removeAttribute('capture');
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                navigate('/crop-doctor', { state: { imageData: reader.result, fileName: file.name } });
            };
            reader.readAsDataURL(file);
        }
        // Reset so the same file can be selected again
        e.target.value = '';
    };

    const handleViewHistory = () => {
        setScannerOpen(false);
        navigate('/crop-doctor', { state: { showHistory: true } });
    };

    return (
        <>
            {/* ── AUTHENTICATED: Full nav with scanner FAB ── */}
            {isAuthenticated && (
                <>
                    {/* Backdrop overlay when scanner menu is open */}
                    {scannerOpen && (
                        <div
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                            onClick={() => setScannerOpen(false)}
                            style={{ animation: 'fadeIn 0.25s ease-out' }}
                        />
                    )}

                    {/* Hidden file input for camera/gallery */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    <div className="fixed bottom-0 left-0 right-0 z-50">
                        {/* Scanner Popup Menu */}
                        {scannerOpen && (
                            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
                                style={{ animation: 'popupSlideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>

                                {/* History Button */}
                                <button
                                    onClick={handleViewHistory}
                                    className="flex items-center gap-2.5 bg-white text-gray-700 pl-4 pr-5 py-2.5 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 active:scale-95 transition-transform"
                                    style={{ animation: 'popupItem 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both' }}
                                >
                                    <span className="text-lg">📋</span>
                                    <span className="text-sm font-semibold">माझे रिपोर्ट</span>
                                </button>

                                {/* Gallery Button */}
                                <button
                                    onClick={handleGalleryUpload}
                                    className="flex items-center gap-2.5 bg-white text-gray-700 pl-4 pr-5 py-2.5 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 active:scale-95 transition-transform"
                                    style={{ animation: 'popupItem 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.08s both' }}
                                >
                                    <span className="text-lg">🖼️</span>
                                    <span className="text-sm font-semibold">गॅलरी</span>
                                </button>

                                {/* Camera Button */}
                                <button
                                    onClick={handleCameraCapture}
                                    className="flex items-center gap-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white pl-4 pr-5 py-3 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all"
                                    style={{ animation: 'popupItem 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0s both' }}
                                >
                                    <span className="text-lg">📷</span>
                                    <span className="text-sm font-bold">फोटो काढा</span>
                                </button>
                            </div>
                        )}

                        {/* Bottom Navigation Bar — Full */}
                        <div className="bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] rounded-t-2xl pb-safe">
                            <div className="flex justify-around items-end pt-2 pb-3 relative">
                                {/* Left nav items */}
                                {navItems.slice(0, 2).map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex flex-col items-center justify-center w-1/5 py-1 transition-colors ${isActive(item.path) ? 'text-green-700' : 'text-gray-400'}`}
                                    >
                                        <span className={`text-2xl mb-1 transition-transform ${isActive(item.path) ? 'transform scale-110' : ''}`}>
                                            {item.icon}
                                        </span>
                                        <span className={`text-[10px] font-medium ${isActive(item.path) ? 'font-bold' : ''}`}>
                                            {item.label}
                                        </span>
                                    </Link>
                                ))}

                                {/* Center Scanner FAB */}
                                <div className="flex flex-col items-center justify-center w-1/5 -mt-7">
                                    <button
                                        onClick={handleScannerClick}
                                        className={`relative w-[60px] h-[60px] rounded-full flex items-center justify-center shadow-xl transition-all duration-300 active:scale-90 ${
                                            scannerOpen
                                                ? 'bg-gradient-to-br from-red-400 to-red-600 rotate-45'
                                                : 'bg-gradient-to-br from-green-500 to-emerald-600'
                                        }`}
                                        style={{
                                            boxShadow: scannerOpen
                                                ? '0 4px 20px rgba(239, 68, 68, 0.45)'
                                                : '0 4px 20px rgba(16, 185, 129, 0.45)'
                                        }}
                                    >
                                        {/* Pulse ring animation */}
                                        {!scannerOpen && (
                                            <span className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-30" />
                                        )}

                                        {/* Ripple effect on click */}
                                        {ripple && (
                                            <span
                                                className="absolute inset-0 rounded-full bg-white/30"
                                                style={{ animation: 'rippleEffect 0.6s ease-out forwards' }}
                                            />
                                        )}

                                        {/* Icon */}
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="white"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="w-7 h-7 transition-transform duration-300"
                                        >
                                            {scannerOpen ? (
                                                <>
                                                    <line x1="12" y1="5" x2="12" y2="19" />
                                                    <line x1="5" y1="12" x2="19" y2="12" />
                                                </>
                                            ) : (
                                                <>
                                                    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                                                    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                                                    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                                                    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                                                    <line x1="7" y1="12" x2="17" y2="12" />
                                                    <path d="M12 7v0" strokeWidth="3" />
                                                    <path d="M9 15l3 2 3-2" />
                                                </>
                                            )}
                                        </svg>
                                    </button>
                                    <span className={`text-[10px] font-bold mt-1 transition-colors ${
                                        scannerOpen ? 'text-red-500' : location.pathname === '/crop-doctor' ? 'text-green-700' : 'text-green-600'
                                    }`}>
                                        {scannerOpen ? 'बंद करा' : 'स्कॅन'}
                                    </span>
                                </div>

                                {/* Right nav items */}
                                {navItems.slice(2).map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex flex-col items-center justify-center w-1/5 py-1 transition-colors ${isActive(item.path) ? 'text-green-700' : 'text-gray-400'}`}
                                    >
                                        <span className={`text-2xl mb-1 transition-transform ${isActive(item.path) ? 'transform scale-110' : ''}`}>
                                            {item.icon}
                                        </span>
                                        <span className={`text-[10px] font-medium ${isActive(item.path) ? 'font-bold' : ''}`}>
                                            {item.label}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ── GUEST: Only Schemes + Officers ── */}
            {!isAuthenticated && (
                <div className="fixed bottom-0 left-0 right-0 z-50">
                    <div className="bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] rounded-t-2xl pb-safe">
                        <div className="flex justify-around items-center pt-2 pb-3">
                            {guestNavItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex flex-col items-center justify-center w-1/2 py-1 transition-colors ${isActive(item.path) ? 'text-green-700' : 'text-gray-400'}`}
                                >
                                    <span className={`text-2xl mb-1 transition-transform ${isActive(item.path) ? 'transform scale-110' : ''}`}>
                                        {item.icon}
                                    </span>
                                    <span className={`text-[10px] font-medium ${isActive(item.path) ? 'font-bold' : ''}`}>
                                        {item.label}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BottomNav;

