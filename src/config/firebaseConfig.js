import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeAuth, 
  getAuth, 
  getReactNativePersistence 
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

// 🔑 Configuración del proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBBOhWrouybvf4dTewK5tFtV7bxk7spYAw",
  authDomain: "mobilestart-f70a9.firebaseapp.com",
  projectId: "mobilestart-f70a9",
  storageBucket: "mobilestart-f70a9.appspot.com",
  messagingSenderId: "966224331213",
  appId: "1:966224331213:web:bf04f6fb11bbb90d9a0484"
};

// 🚀 Evita inicializar Firebase más de una vez
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;

try {
  // 🔐 Inicializa Auth con persistencia usando AsyncStorage
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  console.log("✅ Auth inicializado con persistencia");
} catch (err) {
  // ⚠️ Fallback: si falla AsyncStorage, usa getAuth (sin persistencia)
  console.warn("⚠️ No se pudo usar AsyncStorage, usando getAuth():", err.message);
  auth = getAuth(app);
}

// 📦 Inicializa Firestore (base de datos)
const db = getFirestore(app);

// Exporta para usar en el resto de la app
export { auth, db };
