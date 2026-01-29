import { User } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { firebaseApp } from "./config";

export const db = getFirestore(firebaseApp);

export interface ContractData {
  id: string;
  userId: string;
  status: "pending" | "paid" | "completed" | "cancelled";
  booking: {
    startDate: Timestamp;
    endDate: Timestamp;
    rentalDays: number;
    totalPrice: number;
    pricePerDay?: number;
    createdAt?: any;
  };
  vehicle: {
    id: string;
    name: string;
    image: string;
    brand: string;
    year: number;
    licensePlate: string;
  };
}
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

// Lấy tất cả danh sách xe
export async function getAllVehicles() {
  const snap = await getDocs(collection(db, "vehicles"));

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
// Lấy xe id xe
export async function getVehicleById(id: string) {
  const ref = doc(db, "vehicles", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  };
}
// Lấy dữ liệu từ collection contracts
export async function getUserBookings(uid: string) {
  try {
    const q = query(collection(db, "contracts"), where("userId", "==", uid));

    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting contracts:", error);
    return [];
  }
}

// Lấy xe đã thanh toán
export async function getPaidContracts(uid: string) {
  try {
    const q = query(
      collection(db, "contracts"),
      where("userId", "==", uid),
      where("status", "==", "paid"),
    );

    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ContractData[];
  } catch (error) {
    console.error("Error getting paid contracts:", error);
    return [];
  }
}
