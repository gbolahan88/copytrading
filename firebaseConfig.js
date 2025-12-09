// firebaseConfig.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { browserSessionPersistence, getAuth, GoogleAuthProvider, setPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDZOqGcIuCHi4GpO3Nv2niEvKlzpTFiEWI",
  authDomain: "copy-trading-7bf3c.firebaseapp.com",
  projectId: "copy-trading-7bf3c",
  storageBucket: "copy-trading-7bf3c.firebasestorage.app",
  messagingSenderId: "200168950982",
  appId: "1:200168950982:web:9c8b661c66229207db1bc7"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

setPersistence(auth, browserSessionPersistence);

export default app;
