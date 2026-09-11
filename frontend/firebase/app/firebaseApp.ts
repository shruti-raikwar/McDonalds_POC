import { initializeApp, getApps, getApp } from 'firebase/app';
import { environment } from '../../config/environment';

// Initialize Firebase only once
export const firebaseApp = !getApps().length 
    ? initializeApp(environment.firebase) 
    : getApp();
