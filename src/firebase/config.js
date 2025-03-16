import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Your existing Firebase config
  apiKey: "AIzaSyBZf8idoEEpx2zFwJ4JrdzzI-zCqSV57Cw",
  authDomain: "mediconnect-e269b.firebaseapp.com",
  projectId: "mediconnect-e269b",
  storageBucket: "mediconnect-e269b.appspot.com",
  messagingSenderId: "462881931455",
  appId: "1:462881931455:web:3df4c83d4102ab572b460a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
export default app;
