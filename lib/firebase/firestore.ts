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
    updateDoc,
    where,
} from "firebase/firestore";
import { firebaseApp } from "./config";

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

// Lịch sử thuê xe của user
export async function getBookingsByUser(userId: string) {
  const q = query(collection(db, "bookings"), where("userId", "==", userId));

  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// Lịch sử thuê xe
export async function getAllBookings() {
  const snap = await getDocs(collection(db, "bookings"));

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

/**
 * ✅ LƯU HỢP ĐỒNG VÀO FIREBASE
 */
export async function saveContract(
  userId: string,
  orderId: string,
  contractData: any,
) {
  const ref = doc(db, "contracts", orderId);
  await setDoc(ref, {
    ...contractData,
    userId,
    orderId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * ✅ CẬP NHẬT TRẠNG THÁI HỢP ĐỒNG
 */
export async function updateContractStatus(
  orderId: string,
  status: "pending" | "paid" | "active" | "completed" | "cancelled",
) {
  await updateDoc(doc(db, "contracts", orderId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

/**
 * ✅ LẤY HỢP ĐỒNG THEO ORDER ID
 */
export async function getContractByOrderId(orderId: string) {
  const ref = doc(db, "contracts", orderId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  };
}

/**
 * ✅ LẤY TẤT CẢ HỢP ĐỒNG CỦA USER
 */
export async function getContractsByUser(userId: string) {
  const q = query(collection(db, "contracts"), where("userId", "==", userId));
  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
