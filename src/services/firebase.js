// 📁 src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBWqQyRHUaSm-g4Qx8xtv7RZ_07XVb3uGI",
  authDomain: "modaverse-4bd79.firebaseapp.com",
  projectId: "modaverse-4bd79",
  storageBucket: "modaverse-4bd79.firebasestorage.app",
  messagingSenderId: "379185483801",
  appId: "1:379185483801:android:e8302c0ec1b5c0a2b51a88"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;