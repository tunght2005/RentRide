import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  updateDoc,
  collection,
  addDoc,
} from "firebase/firestore";
import { firebaseApp } from "./config";
import { User } from "firebase/auth";

export const db = getFirestore(firebaseApp);

/**
 * ✅ TẠO PROFILE CHO GOOGLE USER (NẾU CHƯA TỒN TẠI)
 */
export async function createOrUpdateGoogleUser(user: User) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email,
      fullName: user.displayName,
      avatar: user.photoURL,
      role: "user",
      provider: "google",
      createdAt: serverTimestamp(),
    });
  }
}

/**
 * ✅ TẠO PROFILE CHO USER ĐĂNG KÝ MỚI
 */
export async function createUserProfile(user: {
  uid: string;
  email: string;
  fullName: string;
  role?: string;
}) {
  const ref = doc(db, "users", user.uid);
  await setDoc(ref, {
    email: user.email,
    fullName: user.fullName,
    role: user.role || "user",
    createdAt: serverTimestamp(),
  });
}
// update
export async function updateUserProfile(
  uid: string,
  data: {
    fullName?: string;
    phone?: string;
    avatar?: string;
  },
) {
  await updateDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: new Date(),
  });
}
export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

// add vihicle
export async function addVehicle(data: {
  name: string;
  type: string;
  brand: string;
  price: number;
  description?: string;
  mainImage?: string;
  subImages?: string[];
  ratingAvg?: number;
  totalReviews?: number;
  isAvailable: true;
  locationId: string;
  createAt?: any;
  updatedAt?: any;
}) {
  const ref = await addDoc(collection(db, "vehicles"), {
    ...data,
    ratingAvg: 0,
    totalReviews: 0,
    isAvailable: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}