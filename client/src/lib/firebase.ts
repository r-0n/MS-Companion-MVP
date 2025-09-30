import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'your-api-key',
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'your-project'}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'your-project',
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'your-project'}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'your-app-id',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
