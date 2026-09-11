import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppUser } from '../features/auth/types/auth.types';
import { firebaseAuthService } from '../features/auth/services/firebaseAuth.service';

interface AuthContextType {
    user: AppUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = firebaseAuthService.subscribeToAuthChanges((firebaseUser) => {
            if (firebaseUser) {
                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName
                });
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const reloadUser = async () => {
        await firebaseAuthService.reloadUser();
        const currentUser = firebaseAuthService.getCurrentUser();
        if (currentUser) {
            setUser({
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName
            });
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            isLoading, 
            isAuthenticated: !!user,
            reloadUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
