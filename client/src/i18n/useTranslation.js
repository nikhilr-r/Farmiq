import { useContext, useCallback } from 'react';
import UserContext from '../context/UserContext';
import translations from './translations';

/**
 * useTranslation hook
 * Returns:
 *   t(key, vars?) — translate a key, with optional {var} interpolation
 *   lang          — current language code ('mr' | 'en' | 'hi')
 */
const useTranslation = () => {
    const { preferences } = useContext(UserContext);
    const lang = preferences?.language || 'mr';

    const t = useCallback((key, vars) => {
        const entry = translations[key];
        if (!entry) return key; // fallback: show key itself

        let text = entry[lang] || entry['mr'] || key; // fallback chain: lang → mr → key

        // Interpolate {varName} placeholders
        if (vars) {
            Object.keys(vars).forEach((varName) => {
                text = text.replace(`{${varName}}`, vars[varName]);
            });
        }

        return text;
    }, [lang]);

    return { t, lang };
};

export default useTranslation;
