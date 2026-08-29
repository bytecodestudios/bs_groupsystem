import { useEffect } from 'react';
import { create } from 'zustand';
import { useNuiEvent } from './useNuiEvent';
import { fetchNui } from '../utils/fetchNui';
import { isPhoneEnv } from '../utils/phone';
import defaultLocale from '../utils/defaultLocale.json';

interface LocaleState {
    locale: Record<string, string>;
    setLocale: (data: Record<string, any>) => void;
    t: (key: string, ...args: (string | number)[]) => string;
}

/**
 * Flattens a nested object into dot-separated keys.
 * e.g. { a: { b: "hello" } } => { "a.b": "hello" }
 */
function flattenObject(obj: Record<string, any>, prefix = ''): Record<string, string> {
    const result: Record<string, string> = {};
    for (const key of Object.keys(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            Object.assign(result, flattenObject(obj[key], fullKey));
        } else {
            result[fullKey] = String(obj[key]);
        }
    }
    return result;
}

// Bundled English strings. Used as the baseline so the UI never shows raw keys,
// even before (or if) the client pushes a locale. A pushed locale is merged on
// top of this, so any keys it omits still fall back to readable English.
const DEFAULT_LOCALE = flattenObject(defaultLocale as Record<string, any>);

export const useLocaleStore = create<LocaleState>((set, get) => ({
    locale: DEFAULT_LOCALE,
    setLocale: (data: Record<string, any>) => {
        const flattened = flattenObject(data);
        set({ locale: { ...DEFAULT_LOCALE, ...flattened } });
    },
    t: (key: string, ...args: (string | number)[]): string => {
        const { locale } = get();
        let value = locale[key];
        if (value === undefined) {
            // Fallback: return the key itself (last segment)
            return key.split('.').pop() || key;
        }
        // Replace %s placeholders in order
        if (args.length > 0) {
            let i = 0;
            value = value.replace(/%s/g, () => {
                const arg = args[i] !== undefined ? String(args[i]) : '%s';
                i++;
                return arg;
            });
        }
        return value;
    },
}));

/**
 * Hook to initialize the locale listener. Call once in a top-level component.
 */
export function useLocaleListener() {
    useNuiEvent<Record<string, any>>('setLocale', (data) => {
        useLocaleStore.getState().setLocale(data);
    });

    // Phone hosts may open the app before the client pushes locale strings, so
    // pull them once on mount to be safe.
    useEffect(() => {
        if (!isPhoneEnv()) return;
        fetchNui<Record<string, any>>('bsgroup:nui:getLocale')
            .then((data) => {
                if (data && Object.keys(data).length > 0) {
                    useLocaleStore.getState().setLocale(data);
                }
            })
            .catch(() => {});
    }, []);
}

/**
 * Primary hook for components to get the translation function.
 */
export function useLocale() {
    const t = useLocaleStore((state) => state.t);
    return { t };
}
