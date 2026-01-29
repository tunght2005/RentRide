import {
  getFirestore,
  doc,
  deleteDoc,
  setDoc,
  getDoc,
  serverTimestamp,
  updateDoc,
  collection,
  addDoc,
  getDocs, query, orderBy,
  onSnapshot,
} from "firebase/firestore";
import { firebaseApp } from "./config";
import { User } from "firebase/auth";
import { getAuth } from "firebase/auth";

console.log("UID:", getAuth().currentUser?.uid);

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
  images?: string[];
  ratingAvg?: number;
  totalReviews?: number;
  isAvailable: true;
  locationId: string;
  createAt?: any;
  updatedAt?: any;
  transmission?: string; // Hộp số
  seats?: number;        // Số chỗ
  fuel?: string;         // Nhiên liệu
  year?: number;         // Năm sản xuất
  plate?: string;        // Biển số
  status?: string;      // Trạng thái xe
}) 
{
  const ref = await addDoc(collection(db, "vehicles"), {
    ...data,
    totalReviews: 0,
    isAvailable: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}


export async function getVehicles() {
  const q = query(collection(db, "vehicles"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}


export async function deleteVehicle(id: string) {
  const ref = doc(db, "vehicles", id);
  await deleteDoc(ref);
}
// 🔥 Đếm tổng số xe (1 lần)
export async function getTotalVehicles() {
  const snapshot = await getDocs(collection(db, "vehicles"));
  return snapshot.size;
}

// 🔥 Realtime tổng số xe
export function listenTotalVehicles(callback: (total: number) => void) {
  return onSnapshot(collection(db, "vehicles"), (snapshot) => {
    callback(snapshot.size);
  });
}

export const listenLatestVehicles = (callback: (data: any[]) => void) => {
  const q = query(
    collection(db, "vehicles"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    callback(data.slice(0, 5)); // lấy 5 xe mới nhất
  });
}

// ===============================
// 📄 ORDER – TRANG INFO
// ===============================

// Lấy chi tiết 1 đơn thuê xe
export async function getOrderById(orderId: string) {
  const ref = doc(db, "orders", orderId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  };
}

// Realtime theo dõi đơn thuê (dùng cho trang admin duyệt hồ sơ)
export function listenOrderById(
  orderId: string,
  callback: (data: any) => void
) {
  const ref = doc(db, "orders", orderId);

  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback({
        id: snap.id,
        ...snap.data(),
      });
    }
  });
}

// Admin duyệt hồ sơ
export async function approveOrder(orderId: string) {
  await updateDoc(doc(db, "orders", orderId), {
    "documents.status": "approved",
    "documents.updatedAt": serverTimestamp(),
  });
}

// Admin từ chối hồ sơ
export async function rejectOrder(orderId: string, reason: string) {
  await updateDoc(doc(db, "orders", orderId), {
    "documents.status": "rejected",
    "documents.rejectReason": reason,
    "documents.updatedAt": serverTimestamp(),
  });
}

// Realtime danh sách đơn thuê (Dashboard)
export function listenLatestOrders(callback: (data: any[]) => void) {
  const q = query(
    collection(db, "orders"),
    orderBy("booking.createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    callback(data);
  });
}

export async function getVehicleById(id: string) {
  const ref = doc(db, "vehicles", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  };
}