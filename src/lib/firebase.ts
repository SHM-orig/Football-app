import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCFUxMo0B9ZxeijI9khbuNkjMRAhYHwCa0",
  authDomain: "football-website01.firebaseapp.com",
  databaseURL: "https://football-website01-default-rtdb.firebaseio.com",
  projectId: "football-website01",
  storageBucket: "football-website01.firebasestorage.app",
  messagingSenderId: "285768498072",
  appId: "1:285768498072:web:fac1446b74025c4ea4c9ed",
  measurementId: "G-PFMMSRDKTH"
};

function isConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isConfigured()) return null;
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  }
  return getApps()[0] ?? app;
}

export function getFirebaseAuth(): Auth | null {
  const a = getFirebaseApp();
  if (!a) return null;
  if (!auth) auth = getAuth(a);
  return auth;
}

export function getFirebaseDb(): Firestore | null {
  const a = getFirebaseApp();
  if (!a) return null;
  if (!db) db = getFirestore(a);
  return db;
}

export function firebaseReady(): boolean {
  return isConfigured();
}
