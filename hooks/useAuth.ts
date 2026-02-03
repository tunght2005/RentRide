import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
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
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);

  const redirectUri = AuthSession.makeRedirectUri();

  const [, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
    scopes: ["profile", "email"],
    redirectUri,
  });

  // Firebase auth
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

  // Handle Google OAuth
  useEffect(() => {
    if (response?.type === "success") {
      const auth_result = response.authentication;
      console.log(" Google Response:", auth_result);

      if (!auth_result) {
        console.error(" Không có authentication từ Google");
        setGoogleLoading(false);
        return;
      }

      const { idToken, accessToken } = auth_result;

      if (!accessToken) {
        console.error(" Không nhận được accessToken từ Google");
        setGoogleLoading(false);
        return;
      }
      try {
        const credential = GoogleAuthProvider.credential(
          idToken || undefined,
          accessToken,
        );

        signInWithCredential(auth, credential)
          .then(async (result) => {
            console.log(" Đăng nhập Google thành công");

            //  Lấy thông tin user profile từ Google
            const firebaseUser = result.user;

            // photoURL lấy Google API
            if (!firebaseUser.photoURL && accessToken) {
              try {
                const userInfoResponse = await fetch(
                  "https://www.googleapis.com/oauth2/v1/userinfo?access_token=" +
                    accessToken,
                );
                const userInfo = await userInfoResponse.json();

                if (userInfo.picture) {
                  // Up Firebase user với avatar từ Google
                  await updateProfile(firebaseUser, {
                    photoURL: userInfo.picture,
                  });
                  console.log(" Cập nhật avatar từ Google:", userInfo.picture);
                }
              } catch (error) {
                console.warn("Không thể lấy avatar từ Google API:", error);
              }
            }

            setTimeout(() => {
              router.replace("/(tabs)");
              setGoogleLoading(false);
            }, 500);
          })
          .catch((error) => {
            console.error(" Lỗi signInWithCredential:", error.message);
            setGoogleLoading(false);
          });
      } catch (error: any) {
        console.error(" Lỗi tạo credential:", error.message);
        setGoogleLoading(false);
      }
    } else if (response?.type === "dismiss") {
      console.log("User dismissed OAuth");
      setGoogleLoading(false);
    }
  }, [response, router]);

  return {
    user,
    loading,
    googleLoading,

    // USER
    loginWithGoogle: async () => {
      setGoogleLoading(true);
      await promptAsync();
    },

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
