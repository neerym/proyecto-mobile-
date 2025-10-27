import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeAuth, 
  getAuth, 
  getReactNativePersistence 
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
// 👇 mantenemos esto por si más adelante activás Blaze
import { getStorage } from "firebase/storage";

// 🔑 Configuración del proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBBOhWrouybvf4dTewK5tFtV7bxk7spYAw",
  authDomain: "mobilestart-f70a9.firebaseapp.com",
  projectId: "mobilestart-f70a9",
  storageBucket: "mobilestart-f70a9.appspot.com",
  messagingSenderId: "966224331213",
  appId: "1:966224331213:web:bf04f6fb11bbb90d9a0484"
};

// Evita inicializar Firebase más de una vez
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

//  Inicializa Auth de forma segura (para Expo + RN)
let auth;
try {
  if (typeof initializeAuth === "function" && getReactNativePersistence) {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    console.log("✅ Auth inicializado con persistencia en AsyncStorage");
  } else {
    auth = getAuth(app);
    console.warn("⚠️ initializeAuth no está disponible, usando getAuth()");
  }
} catch (err) {
  console.warn("⚠️ Error inicializando Auth:", err.message);
  auth = getAuth(app);
}

//  Inicializa Firestore y Storage (aunque no lo uses aún)
const db = getFirestore(app);
const storage = getStorage(app); 

//  Exportación única y limpia
export { auth, db, storage };
