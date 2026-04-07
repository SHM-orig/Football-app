"use client";

import { firebaseReady, getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import type { UserProfile } from "@/lib/types";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  firebaseEnabled: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  toggleFavoriteTeam: (teamId: string) => Promise<void>;
  toggleFavoritePlayer: (playerId: string) => Promise<void>;
  isFavoriteTeam: (teamId: string) => boolean;
  isFavoritePlayer: (playerId: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function emptyProfile(uid: string, user: User | null): UserProfile {
  return {
    uid,
    email: user?.email ?? null,
    displayName: user?.displayName ?? null,
    favoriteTeamIds: [],
    favoritePlayerIds: [],
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const firebaseEnabled = firebaseReady();
  const [loading, setLoading] = useState(firebaseEnabled);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      return;
    }
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const db = getFirebaseDb();
      if (!db) {
        setProfile(emptyProfile(u.uid, u));
        setLoading(false);
        return;
      }
      const ref = doc(db, "users", u.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          email: u.email,
          displayName: u.displayName,
          favoriteTeamIds: [],
          favoritePlayerIds: [],
          createdAt: serverTimestamp(),
        });
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const db = getFirebaseDb();
    if (!user || !db) return;
    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      const d = snap.data();
      setProfile({
        uid: user.uid,
        email: user.email,
        displayName: (d?.displayName as string) ?? user.displayName,
        favoriteTeamIds: (d?.favoriteTeamIds as string[]) ?? [],
        favoritePlayerIds: (d?.favoritePlayerIds as string[]) ?? [],
      });
    });
    return () => unsub();
  }, [user]);

  const signInEmail = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase is not configured");
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signUpEmail = useCallback(
    async (email: string, password: string, displayName?: string) => {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Firebase is not configured");
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const db = getFirebaseDb();
      if (db) {
        await setDoc(doc(db, "users", cred.user.uid), {
          email: cred.user.email,
          displayName: displayName ?? "",
          favoriteTeamIds: [],
          favoritePlayerIds: [],
          createdAt: serverTimestamp(),
        });
      }
    },
    [],
  );

  const signInGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase is not configured");
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }, []);

  const logOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (auth) await signOut(auth);
  }, []);

  const toggleFavoriteTeam = useCallback(
    async (teamId: string) => {
      const db = getFirebaseDb();
      if (!user || !db || !profile) return;
      const ref = doc(db, "users", user.uid);
      const has = profile.favoriteTeamIds.includes(teamId);
      const next = has
        ? profile.favoriteTeamIds.filter((id) => id !== teamId)
        : [...profile.favoriteTeamIds, teamId];
      await updateDoc(ref, { favoriteTeamIds: next });
    },
    [user, profile],
  );

  const toggleFavoritePlayer = useCallback(
    async (playerId: string) => {
      const db = getFirebaseDb();
      if (!user || !db || !profile) return;
      const ref = doc(db, "users", user.uid);
      const has = profile.favoritePlayerIds.includes(playerId);
      const next = has
        ? profile.favoritePlayerIds.filter((id) => id !== playerId)
        : [...profile.favoritePlayerIds, playerId];
      await updateDoc(ref, { favoritePlayerIds: next });
    },
    [user, profile],
  );

  const isFavoriteTeam = useCallback(
    (teamId: string) => profile?.favoriteTeamIds.includes(teamId) ?? false,
    [profile],
  );

  const isFavoritePlayer = useCallback(
    (playerId: string) =>
      profile?.favoritePlayerIds.includes(playerId) ?? false,
    [profile],
  );

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      firebaseEnabled,
      signInEmail,
      signUpEmail,
      signInGoogle,
      logOut,
      toggleFavoriteTeam,
      toggleFavoritePlayer,
      isFavoriteTeam,
      isFavoritePlayer,
    }),
    [
      user,
      profile,
      loading,
      firebaseEnabled,
      signInEmail,
      signUpEmail,
      signInGoogle,
      logOut,
      toggleFavoriteTeam,
      toggleFavoritePlayer,
      isFavoriteTeam,
      isFavoritePlayer,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
