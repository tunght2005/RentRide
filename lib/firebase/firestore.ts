import { User, getAuth  } from "firebase/auth";
import {
  collection,
  doc,
  deleteDoc,
  setDoc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,orderBy,

    updateDoc,
    where,
  onSnapshot,
} from "firebase/firestore";
import { firebaseApp } from "./config";

console.log("UID:", getAuth().currentUser?.uid);

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

// Lấy xe id xe
export async function getVehicleById(id: string) {
  const ref = doc(db, "vehicles", id);


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

