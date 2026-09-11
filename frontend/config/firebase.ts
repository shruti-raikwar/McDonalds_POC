import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCAXTs8ev5xb4nRpP0Oe8WNrmK0T112sks",
    authDomain: "geeqdmr-song-data-ai-sbox-gcp.firebaseapp.com",
    projectId: "geeqdmr-song-data-ai-sbox-gcp",
    storageBucket: "geeqdmr-song-data-ai-sbox-gcp.firebasestorage.app",
    messagingSenderId: "368061194181",
    appId: "1:368061194181:web:918e1313c4bc6ac66435ac"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
