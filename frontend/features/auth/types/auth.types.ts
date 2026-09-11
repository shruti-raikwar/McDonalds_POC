export interface AppUser {
    uid: string;
    email: string | null;
    displayName: string | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignUpCredentials extends LoginCredentials {
    username: string;
}

export interface AuthState {
    user: AppUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}
