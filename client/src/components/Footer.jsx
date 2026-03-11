import { Heart } from 'lucide-react';
import useTranslation from '../i18n/useTranslation';

const Footer = () => {
    const { t } = useTranslation();
    return (
        <footer className="bg-gray-900 text-gray-400 py-8 mt-8">
            <div className="container mx-auto px-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">F</div>
                    <span className="text-white font-bold text-base tracking-tight">Farmiq</span>
                </div>
                <p className="text-sm flex items-center justify-center gap-1">
                    {t('footer.madeFor')}
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                </p>
                <p className="text-xs text-gray-600 mt-2 max-w-md mx-auto">{t('footer.source')}</p>
                <div className="mt-4 text-xs text-gray-600 font-medium">Farmiq v2.0</div>
            </div>
        </footer>
    );
};

export default Footer;
