import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAu0y9ZECGLn2-LUlNy32O6IEhHRn3nj30",
  authDomain: "teastall-saas.firebaseapp.com",
  projectId: "teastall-saas",
  storageBucket: "teastall-saas.firebasestorage.app",
  messagingSenderId: "997901628219",
  appId: "1:997901628219:web:6d7c0f8d91f0778df4fd1e",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
