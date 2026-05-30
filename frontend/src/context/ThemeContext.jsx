import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('supplyshield_theme');
        if (saved) return saved === 'dark';
        // Default: prefer dark
        return !window.matchMedia('(prefers-color-scheme: light)').matches;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.remove('light-mode');
        } else {
            root.classList.add('light-mode');
        }
        localStorage.setItem('supplyshield_theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const toggle = () => setIsDark(prev => !prev);

    return (
        <ThemeContext.Provider value={{ isDark, toggle }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) return { isDark: true, toggle: () => { } };
    return ctx;
}
