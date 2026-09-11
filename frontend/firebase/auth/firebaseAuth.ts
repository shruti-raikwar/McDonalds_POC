import { getAuth } from 'firebase/auth';
import { firebaseApp } from '../app/firebaseApp';

export const auth = getAuth(firebaseApp);
