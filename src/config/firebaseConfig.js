import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBBOhWrouybvf4dTewK5tFtV7bxk7spYAw",
  authDomain: "mobilestart-f70a9.firebaseapp.com",
  projectId: "mobilestart-f70a9",
  storageBucket: "mobilestart-f70a9.appspot.com",
  messagingSenderId: "966224331213",
  appId: "1:966224331213:web:bf04f6fb11bbb90d9a0484"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
