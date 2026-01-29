# Contract Firebase Integration - Hướng Dẫn Triển Khai

## 🎯 Mục tiêu

Lưu hợp đồng vào Firebase Firestore khi khách hàng bắt đầu thanh toán, cập nhật trạng thái sau khi thanh toán thành công, và quay lại trang chủ.

## 📋 Các Thay Đổi Thực Hiện

### 1. **lib/firebase/firestore.ts**

Thêm 4 hàm mới để quản lý contracts:

- `saveContract(userId, orderId, contractData)` - Lưu hợp đồng vào Firebase
- `updateContractStatus(orderId, status)` - Cập nhật trạng thái hợp đồng
- `getContractByOrderId(orderId)` - Lấy hợp đồng theo Order ID
- `getContractsByUser(userId)` - Lấy tất cả hợp đồng của user

**Cấu trúc dữ liệu contract:**

```typescript
{
  // Thông tin user
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  permanentAddress: string;
  cccdNumber: string;
  dob: string;

  // Thông tin bằng lái
  licenseNumber: string;
  licenseClass: string;

  // Ảnh tài liệu
  idFrontImage: string;
  idBackImage: string;
  licenseImage: string;

  // Thông tin xe
  vehicleId: string;
  vehicleName: string;
  vehicleBrand: string;
  vehicleYear: number;
  licensePlate: string;
  vehicleImage: string;

  // Thông tin đặt xe
  startDate: string; // ISO format
  endDate: string; // ISO format
  rentalDays: number;
  pricePerDay: number;
  totalPrice: number;

  // Trạng thái
  orderId: string;
  status: "pending" | "paid" | "active" | "completed" | "cancelled";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2. **app/vehicle/contract.tsx**

Cập nhật import và logic:

**Import mới:**

```typescript
import { useAuth } from "@/hooks/useAuth";
import { saveContract } from "@/lib/firebase/firestore";
```

**Thêm state:**

- `isProcessingPayment` - Theo dõi trạng thái khi đang xử lý thanh toán

**Cập nhật hàm handleContinue:**

- Kiểm tra user đã đăng nhập
- Tạo orderId từ timestamp
- Lưu contract vào Firebase trước khi mở link thanh toán
- Xử lý lỗi khi lưu contract

**Cập nhật UI:**

- Disable button khi đang xử lý thanh toán
- Hiển thị loading indicator trên button

### 3. **app/payment-success.tsx**

Cập nhật logic xử lý khi thanh toán thành công:

**Import mới:**

```typescript
import { updateContractStatus } from "@/lib/firebase/firestore";
import { useLocalSearchParams } from "expo-router";
```

**Thêm logic:**

- Lấy `orderId` từ URL params
- Cập nhật trạng thái contract từ "pending" → "paid"
- Xử lý lỗi nếu không cập nhật được
- Quay lại trang chủ (/)

## 🔄 Quy Trình Hoạt Động

```
1. User điền đầy đủ thông tin trên trang contract
   ↓
2. Click "Tiếp tục" → Hàm handleContinue được gọi
   ↓
3. Lưu contract vào Firebase với status = "pending"
   → Contract được lưu với orderId làm document ID
   ↓
4. Tạo link thanh toán VNPay với orderId
   ↓
5. Mở link thanh toán
   ↓
6. User hoàn thành thanh toán
   ↓
7. VNPay redirect về payment-success page với orderId
   ↓
8. payment-success page lấy orderId từ URL
   ↓
9. Cập nhật contract status: "pending" → "paid"
   ↓
10. Hiển thị thông báo thành công
    ↓
11. Quay lại trang chủ (/)
```

## 📊 Firestore Collection Structure

```
contracts/
├── {orderId}/
│   ├── userId: string
│   ├── fullName: string
│   ├── phone: string
│   ├── email: string
│   ├── address: string
│   ├── permanentAddress: string
│   ├── cccdNumber: string
│   ├── dob: string
│   ├── licenseNumber: string
│   ├── licenseClass: string
│   ├── idFrontImage: string (Cloudinary URL)
│   ├── idBackImage: string (Cloudinary URL)
│   ├── licenseImage: string (Cloudinary URL)
│   ├── vehicleId: string
│   ├── vehicleName: string
│   ├── vehicleBrand: string
│   ├── vehicleYear: number
│   ├── licensePlate: string
│   ├── vehicleImage: string (Cloudinary URL)
│   ├── startDate: string (ISO)
│   ├── endDate: string (ISO)
│   ├── rentalDays: number
│   ├── pricePerDay: number
│   ├── totalPrice: number
│   ├── orderId: string
│   ├── status: "pending" | "paid" | "active" | "completed" | "cancelled"
│   ├── createdAt: Timestamp
│   └── updatedAt: Timestamp
```

## ⚙️ Cấu Hình Cần Thiết

### Firebase Rules (Firestore)

```javascript
match /contracts/{document=**} {
  allow read: if request.auth.uid == resource.data.userId;
  allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
  allow update: if request.auth != null && request.auth.uid == resource.data.userId;
  allow delete: if false;
}
```

### Cloud Function (VNPay Payment)

Đảm bảo Cloud Function:

1. Truyền `orderId` vào URL return sau thanh toán
2. Ví dụ: `https://yourapp.com/payment-success?orderId={orderId}`

## 🔧 Hàm Hỗ Trợ

### Lấy hợp đồng của user

```typescript
import { getContractsByUser } from "@/lib/firebase/firestore";

const contracts = await getContractsByUser(userId);
```

### Cập nhật trạng thái hợp đồng

```typescript
import { updateContractStatus } from "@/lib/firebase/firestore";

// Trạng thái có thể là: pending, paid, active, completed, cancelled
await updateContractStatus(orderId, "active");
```

## ✅ Checklist Triển Khai

- [x] Thêm hàm saveContract vào firestore.ts
- [x] Thêm hàm updateContractStatus vào firestore.ts
- [x] Cập nhật contract.tsx để lưu contract trước khi thanh toán
- [x] Cập nhật payment-success.tsx để update status sau thanh toán
- [x] Kiểm tra lỗi TypeScript
- [ ] Test trên device/emulator
- [ ] Kiểm tra Firebase Firestore rules
- [ ] Kiểm tra URL redirect từ VNPay có orderId

## 🐛 Troubleshooting

**Vấn đề:** Contract không được lưu

- Kiểm tra user đã đăng nhập chưa
- Kiểm tra Firebase Firestore rules
- Kiểm tra console.log để xem error

**Vấn đề:** Status không update sau thanh toán

- Kiểm tra URL redirect có chứa orderId không
- Kiểm tra `params.orderId` có được lấy đúng không
- Kiểm tra Firebase Firestore rules cho phép update

**Vấn đề:** Lỗi khi lưu contract

- Kiểm tra tất cả required fields đã được điền
- Kiểm tra image URLs từ Cloudinary có valid không
- Kiểm tra kết nối Firebase
