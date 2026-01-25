import { firebaseApp } from "./config";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  User,
  updatePassword,
  sendPasswordResetEmail,
} from "firebase/auth";

export const auth = getAuth(firebaseApp);

export {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  User,
};
export async function changePassword(newPassword: string) {
  const auth = getAuth();
  if (!auth.currentUser) throw new Error("Chưa đăng nhập");

  await updatePassword(auth.currentUser, newPassword);
}
export async function resetPassword(email: string) {
  const auth = getAuth();

  if (!email) {
    throw new Error("Vui lòng nhập email");
  }

  await sendPasswordResetEmail(auth, email);
}
