import { auth } from '../../../firebase/auth/firebaseAuth';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    updateProfile, 
    signOut,
    onAuthStateChanged,
    User
} from 'firebase/auth';
import { LoginCredentials, SignUpCredentials } from '../types/auth.types';

export const firebaseAuthService = {
    signUp: async ({ email, password, username }: SignUpCredentials): Promise<User> => {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName: username });
        await credential.user.reload();
        return auth.currentUser || credential.user;
    },

    signIn: async ({ email, password }: LoginCredentials): Promise<User> => {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        return credential.user;
    },

    logout: async (): Promise<void> => {
        await signOut(auth);
    },

    subscribeToAuthChanges: (callback: (user: User | null) => void) => {
        return onAuthStateChanged(auth, callback);
    },

    getCurrentUser: (): User | null => {
        return auth.currentUser;
    },
    
    reloadUser: async (): Promise<void> => {
        if (auth.currentUser) {
            await auth.currentUser.reload();
        }
    }
};
