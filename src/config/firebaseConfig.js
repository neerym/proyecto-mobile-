import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeAuth, 
  getAuth, 
  getReactNativePersistence 
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBBOhWrouybvf4dTewK5tFtV7bxk7spYAw",
  authDomain: "mobilestart-f70a9.firebaseapp.com",
  projectId: "mobilestart-f70a9",
  storageBucket: "mobilestart-f70a9.appspot.com",
  messagingSenderId: "966224331213",
  appId: "1:966224331213:web:bf04f6fb11bbb90d9a0484"
};

// Evita inicializar más de una vez
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  console.log("✅ Auth inicializado con persistencia");
} catch (err) {
  console.warn("⚠️ No se pudo usar AsyncStorage, usando getAuth():", err.message);
  auth = getAuth(app); // fallback → no persiste, pero no crasheaa
}

const db = getFirestore(app);

export { auth, db };
