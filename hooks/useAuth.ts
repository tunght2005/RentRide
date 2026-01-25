import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
  GoogleAuthProvider,
  signInWithCredential,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";

import { auth } from "../lib/firebase/auth";
import {
  createOrUpdateGoogleUser,
  createUserProfile,
} from "../lib/firebase/firestore";

WebBrowser.maybeCompleteAuthSession();

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const redirectUri = AuthSession.makeRedirectUri();

  const [, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
    scopes: ["profile", "email"],
    redirectUri,
  });

  // Firebase auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);

      if (u && u.providerData.some((p) => p.providerId === "google.com")) {
        await createOrUpdateGoogleUser(u);
      }
    });

    return unsub;
  }, []);

  // Handle Google OAuth result
  useEffect(() => {
    if (response?.type === "success") {
      const { accessToken } = response.authentication ?? {};
      if (!accessToken) return;

      const credential = GoogleAuthProvider.credential(null, accessToken);

      signInWithCredential(auth, credential);
    }
  }, [response]);

  return {
    user,
    loading,

    // USER
    loginWithGoogle: () => promptAsync(),

    // ADMIN
    loginAdmin: (email: string, password: string) =>
      signInWithEmailAndPassword(auth, email, password),

    logout: () => signOut(auth),

    // REGISTER
    register: async ({ email, password, fullName }: any) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: fullName });
        await createUserProfile({
          uid: cred.user.uid,
          email: cred.user.email!,
          fullName,
          role: "user",
        });
      }
    },
  };
}
