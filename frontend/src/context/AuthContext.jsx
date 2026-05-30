import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useUser, useClerk, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { setClerkTokenGetter } from '../services/api';

const AuthContext = createContext(null);

const PREMIUM_STORAGE_KEY = 'supplyshield_premium';

export function AuthProvider({ children }) {
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const { getToken } = useClerkAuth();

    // Track premium status in localStorage (for demo — no payment gateway)
    const [isPremium, setIsPremium] = useState(() => {
        try {
            return localStorage.getItem(PREMIUM_STORAGE_KEY) === 'true';
        } catch {
            return false;
        }
    });

    // Connect Clerk's token to our API layer
    useEffect(() => {
        if (isLoaded && user) {
            setClerkTokenGetter(getToken);
        }
    }, [isLoaded, user, getToken]);

    const upgradeToPremium = useCallback(() => {
        setIsPremium(true);
        localStorage.setItem(PREMIUM_STORAGE_KEY, 'true');
    }, []);

    const downgradeToFree = useCallback(() => {
        setIsPremium(false);
        localStorage.removeItem(PREMIUM_STORAGE_KEY);
    }, []);

    const value = {
        user: user ? {
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            full_name: user.fullName,
            imageUrl: user.imageUrl,
            subscription_tier: isPremium ? 'paid' : 'free',
        } : null,
        loading: !isLoaded,
        logout: () => {
            // Clear premium on logout if you want, or keep it
            signOut();
        },
        isPremium,
        upgradeToPremium,
        downgradeToFree,
        login: () => { }, // Clerk handles login via components
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) return { user: null, loading: true, logout: () => { }, isPremium: false, upgradeToPremium: () => { }, downgradeToFree: () => { }, login: () => { } };
    return context;
}
