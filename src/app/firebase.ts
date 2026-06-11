// app/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCIb_94U8RD27qXA-bGRbClTyPxdpTSXAs",
  authDomain: "expense-tracker-b3607.firebaseapp.com",
  projectId: "expense-tracker-b3607",
  storageBucket: "expense-tracker-b3607.firebasestorage.app",
  messagingSenderId: "1013544504116",
  appId: "1:1013544504116:web:30f120b1205c8da14eb361",
};

// Khởi tạo Firebase (tránh khởi tạo lại nếu đã có)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
