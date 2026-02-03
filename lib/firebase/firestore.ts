import { User, getAuth } from "firebase/auth";
import {
  collection,
  doc,
  deleteDoc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  limit,
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
// TẠO PROFILE CHO GOOGLE USER nếu chưa tồn tại
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

// TẠO PROFILE CHO new USER
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
  transmission?: string;
  seats?: number;
  fuel?: string;
  year?: number;
  plate?: string;
  status?: string;
}) {
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
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  };
}

export async function deleteVehicle(id: string) {
  try {
    const ref = doc(db, "vehicles", id);

    // Kiểm tra xe có tồn tại không
    const vehicleDoc = await getDoc(ref);
    if (!vehicleDoc.exists()) {
      throw new Error("Xe không tồn tại");
    }

    await deleteDoc(ref);
    console.log("Xóa xe thành công:", id);
    return { success: true, message: "Xóa xe thành công" };
  } catch (error: any) {
    console.error("Lỗi xóa xe:", error.message);
    throw new Error(error.message || "Không thể xóa xe. Kiểm tra quyền admin.");
  }
}
// Đếm tổng số xe
export async function getTotalVehicles() {
  const snapshot = await getDocs(collection(db, "vehicles"));
  return snapshot.size;
}

// Realtime tổng số xe
export function listenTotalVehicles(callback: (total: number) => void) {
  return onSnapshot(collection(db, "vehicles"), (snapshot) => {
    callback(snapshot.size);
  });
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

// LƯU HỢP ĐỒNG VÀO FIREBASE
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

// CẬP NHẬT TRẠNG THÁI HỢP ĐỒNG
export async function updateContractStatus(
  orderId: string,
  status: "pending" | "paid" | "active" | "completed" | "cancelled",
) {
  await updateDoc(doc(db, "contracts", orderId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

// LẤY HỢP ĐỒNG THEO ORDER ID
export async function getContractByOrderId(orderId: string): Promise<any> {
  const ref = doc(db, "contracts", orderId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  };
}

// LẤY TẤT CẢ HỢP ĐỒNG CỦA USER
export async function getContractsByUser(userId: string) {
  const q = query(collection(db, "contracts"), where("userId", "==", userId));
  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// DOANH THU (CONTRACTS ĐƯỢC THANH TOÁN)
export function listenTotalRevenue(callback: (total: number) => void) {
  const q = query(collection(db, "contracts"));

  return onSnapshot(
    q,
    (snapshot) => {
      let total = 0;
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        total += data.booking?.totalPrice || 0;
      });
      callback(total);
    },
    (error) => {
      console.error("listenTotalRevenue error:", error);
      callback(0);
    },
  );
}

// DANH SÁCH HỢP ĐỒNG GẦN ĐÂY
export function listenLatestContracts(
  callback: (data: any[]) => void,
  limitCount: number = 5,
) {
  const q = query(
    collection(db, "contracts"),
    orderBy("createdAt", "desc"),
    limit(limitCount),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      callback(data);
    },
    (error) => {
      console.error("listenLatestContracts error:", error);
      callback([]);
    },
  );
}
