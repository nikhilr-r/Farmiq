import { useState, useRef, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import UserContext from '../context/UserContext';
import useTranslation from '../i18n/useTranslation';
import { Home, Sprout, Landmark, PhoneCall, X, Camera, Image, ClipboardList } from 'lucide-react';

const BottomNav = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useContext(UserContext);
    const { t } = useTranslation();
    const [scannerOpen, setScannerOpen] = useState(false);
    const [ripple, setRipple] = useState(false);
    const fileInputRef = useRef(null);

    const isActive = (path) => location.pathname === path;

    const guestNavItems = [
        { path: '/schemes', key: 'header.schemes', Icon: Landmark },
        { path: '/officers', key: 'header.officers', Icon: PhoneCall },
    ];

    const navItems = [
        { path: '/', key: 'header.home', Icon: Home },
        { path: '/crops', key: 'header.crops', Icon: Sprout },
        { path: '/schemes', key: 'header.schemes', Icon: Landmark },
        { path: '/officers', key: 'header.officers', Icon: PhoneCall },
    ];

    const handleScannerClick = () => {
        setRipple(true);
        setTimeout(() => setRipple(false), 600);
        setScannerOpen(!scannerOpen);
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
    };

    const handleViewHistory = () => {
        setScannerOpen(false);
        navigate('/crop-doctor', { state: { showHistory: true } });
    };

    const NavItem = ({ path, key: tKey, Icon, wide }) => (
        <Link
            to={path}
            className={`flex flex-col items-center justify-center ${wide ? 'w-1/2' : 'w-1/5'} py-1 transition-all duration-200`}
        >
            <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl mb-0.5 transition-all duration-200 ${
                isActive(path) ? 'bg-green-50' : ''
            }`}>
                <Icon
                    className={`w-[22px] h-[22px] transition-all duration-200 ${
                        isActive(path) ? 'text-green-700' : 'text-gray-400'
                    }`}
                    strokeWidth={isActive(path) ? 2.5 : 1.8}
                />
            </div>
            <span className={`text-[10px] font-semibold transition-colors duration-200 ${
                isActive(path) ? 'text-green-700' : 'text-gray-400'
            }`}>
                {t(tKey)}
            </span>
            {isActive(path) && (
                <div className="w-1 h-1 rounded-full bg-green-600 mt-0.5" />
            )}
        </Link>
    );

    return (
        <>
            {isAuthenticated && (
                <>
                    {scannerOpen && (
                        <div
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                            onClick={() => setScannerOpen(false)}
                            style={{ animation: 'fadeIn 0.25s ease-out' }}
                        />
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    <div className="fixed bottom-0 left-0 right-0 z-50">
                        {scannerOpen && (
                            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
                                style={{ animation: 'popupSlideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                                <button
                                    onClick={handleViewHistory}
                                    className="flex items-center gap-2.5 bg-white text-gray-700 pl-4 pr-5 py-2.5 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 active:scale-95 transition-transform"
                                    style={{ animation: 'popupItem 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both' }}
                                >
                                    <ClipboardList className="w-5 h-5 text-blue-500" />
                                    <span className="text-sm font-semibold">{t('nav.myReports')}</span>
                                </button>
                                <button
                                    onClick={handleGalleryUpload}
                                    className="flex items-center gap-2.5 bg-white text-gray-700 pl-4 pr-5 py-2.5 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 active:scale-95 transition-transform"
                                    style={{ animation: 'popupItem 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.08s both' }}
                                >
                                    <Image className="w-5 h-5 text-purple-500" />
                                    <span className="text-sm font-semibold">{t('nav.gallery')}</span>
                                </button>
                                <button
                                    onClick={handleCameraCapture}
                                    className="flex items-center gap-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white pl-4 pr-5 py-3 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all"
                                    style={{ animation: 'popupItem 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0s both' }}
                                >
                                    <Camera className="w-5 h-5" />
                                    <span className="text-sm font-bold">{t('nav.camera')}</span>
                                </button>
                            </div>
                        )}

                        <div className="bg-white/95 backdrop-blur-lg border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] rounded-t-2xl pb-safe">
                            <div className="flex justify-around items-end pt-2 pb-2.5 relative">
                                {navItems.slice(0, 2).map((item) => (
                                    <NavItem key={item.path} {...item} />
                                ))}

                                <div className="flex flex-col items-center justify-center w-1/5 -mt-7">
                                    <button
                                        onClick={handleScannerClick}
                                        className={`relative w-[58px] h-[58px] rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 active:scale-90 ${
                                            scannerOpen
                                                ? 'bg-gradient-to-br from-red-400 to-red-600 rotate-0'
                                                : 'bg-gradient-to-br from-green-500 to-emerald-600'
                                        }`}
                                        style={{
                                            boxShadow: scannerOpen
                                                ? '0 4px 20px rgba(239, 68, 68, 0.40)'
                                                : '0 4px 20px rgba(16, 185, 129, 0.40)'
                                        }}
                                    >
                                        {!scannerOpen && (
                                            <span className="absolute inset-0 rounded-2xl border-2 border-green-400 animate-ping opacity-25" />
                                        )}
                                        {ripple && (
                                            <span
                                                className="absolute inset-0 rounded-2xl bg-white/30"
                                                style={{ animation: 'rippleEffect 0.6s ease-out forwards' }}
                                            />
                                        )}
                                        {scannerOpen ? (
                                            <X className="w-7 h-7 text-white" strokeWidth={2.5} />
                                        ) : (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                                                <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                                                <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                                                <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                                                <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                                                <line x1="7" y1="12" x2="17" y2="12" />
                                                <path d="M12 7v0" strokeWidth="3" />
                                                <path d="M9 15l3 2 3-2" />
                                            </svg>
                                        )}
                                    </button>
                                    <span className={`text-[10px] font-bold mt-1 transition-colors ${
                                        scannerOpen ? 'text-red-500' : location.pathname === '/crop-doctor' ? 'text-green-700' : 'text-green-600'
                                    }`}>
                                        {scannerOpen ? t('nav.close') : t('nav.scan')}
                                    </span>
                                </div>

                                {navItems.slice(2).map((item) => (
                                    <NavItem key={item.path} {...item} />
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {!isAuthenticated && (
                <div className="fixed bottom-0 left-0 right-0 z-50">
                    <div className="bg-white/95 backdrop-blur-lg border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] rounded-t-2xl pb-safe">
                        <div className="flex justify-around items-center pt-2 pb-2.5">
                            {guestNavItems.map((item) => (
                                <NavItem key={item.path} {...item} wide />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BottomNav;
