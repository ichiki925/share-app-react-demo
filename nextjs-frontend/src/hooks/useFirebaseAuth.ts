'use client'

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    User,
} from 'firebase/auth';
import { app } from '@/lib/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
}

interface AuthProviderProps {
    children: ReactNode;
}

interface UseFirebaseAuthReturn {
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, username: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoggedIn: boolean;
    isLoading: boolean;
    user: User | null;
    getErrorMessage: (error: any) => string;
    getAuthToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
});



export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);


    const value: AuthContextType = {
        user,
        loading,
    };

    return React.createElement(AuthContext.Provider, { value: value }, children);

};

export const useFirebaseAuth = (): UseFirebaseAuthReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const context = useContext(AuthContext);

    const user = context.user;
    const isLoggedIn = user !== null;


    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const auth = getAuth(app);
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (email: string, password: string, username: string) => {
        setIsLoading(true);
        try {
            const auth = getAuth(app);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            await updateProfile(userCredential.user, {
                displayName: username,
            });
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            const auth = getAuth(app);
            await signOut(auth);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const getErrorMessage = (error: any): string => {
        switch (error?.code) {
            case 'auth/user-not-found':
                return 'アカウントが見つかりません';
            case 'auth/wrong-password':
                return 'パスワードが間違っています';
            case 'auth/email-already-in-use':
                return 'このメールアドレスは既に使用されています';
            case 'auth/weak-password':
                return 'パスワードが弱すぎます';
            case 'auth/invalid-email':
                return '無効なメールアドレスです';
            case 'auth/too-many-requests':
                return 'リクエストが多すぎます。しばらく待ってから再度お試しください';
            default:
                return 'エラーが発生しました';
        }
    };

    const getAuthToken = async (): Promise<string | null> => {
        try {
            if (user) {
                return await user.getIdToken();
            }
            return null;
        } catch (error) {
            console.error('トークン取得エラー:', error);
            return null;
        }
    };

    return {
        login,
        register,
        logout,
        isLoggedIn,
        isLoading,
        user,
        getErrorMessage,
        getAuthToken,
    };
};