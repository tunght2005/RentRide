# FPT.AI & Upload Ảnh - Setup Hoàn Tất ✅

## 📋 Tóm tắt những gì đã setup

### 1. **FPT.AI API Integration** ✅
- **Status**: Hoàn tất
- **API Key**: `Dl9yb4Es3qN3qXwUKUuKYdWBohbS9JP5` (configured in .env)
- **Service**: `lib/ocr.ts`
  - `extractDataFromFPTAI()` - Gọi FPT.AI API
  - `convertImageToBase64()` - Convert ảnh sang base64
- **Location**: https://api.fpt.ai/vision/idr/recognize

### 2. **Real Image Picker** ✅
- **Status**: Hoàn tất
- **Functions**: 
  - `takePhoto()` - Chụp ảnh từ camera
  - `pickImage()` - Chọn ảnh từ thư viện
- **File**: `utils/pickImage.ts`
- **Permissions**: Tự động request khi cần

### 3. **Contract Page Integration** ✅
- **Status**: Hoàn tất
- **Updates**: `app/vehicle/contract.tsx`
  - Import image picker functions
  - Updated `handleUploadDocument()` để dùng real image picker
  - Replace mock OCR bằng FPT.AI integration
  - Added loading indicator (OCR processing)
  - Added error handling

### 4. **Dependencies** ✅
- `axios` - HTTP client for API
- `expo-file-system` - File system operations
- `expo-image-picker` - Camera & gallery

### 5. **Environment Variables** ✅
```env
EXPO_PUBLIC_FPT_AI_API_KEY=Dl9yb4Es3qN3qXwUKUuKYdWBohbS9JP5
```

---

## 🎯 Cách dùng để Test

### Scenario 1: Chụp ảnh từ Camera
```
1. Mở app → Navigate tới Contract page
2. Click "Tải ảnh" ở CMND/CCCD (Mặt trước)
3. Alert hiện lên với 2 option
4. Click "Chụp ảnh"
5. Camera mở lên
6. Chụp ảnh CMND/CCCD (rõ ràng, đủ sáng)
7. Ứng dụng tự động:
   - Convert ảnh sang base64
   - Gọi FPT.AI API
   - Hiển thị loading indicator
   - Tự động điền: Họ & tên, Số CMND/CCCD
8. Alert "Thành công" xuất hiện
```

### Scenario 2: Chọn ảnh từ Thư viện
```
1. Click "Tải ảnh" → "Chọn từ thư viện"
2. Photo library mở lên
3. Chọn ảnh CMND/CCCD, bằng lái, v.v.
4. Quá trình xử lý giống scenario 1
```

---

## 📊 Dữ liệu Trích Xuất

### Từ CMND/CCCD Mặt Trước:
```
fullName: "Nguyễn Văn A"
cccdNumber: "0792030123456"
dob: "01/01/1990"
```

### Từ CMND/CCCD Mặt Sau:
```
cccdNumber: "0792030123456"
```

### Từ Bằng Lái:
```
fullName: "Nguyễn Văn A"
licenseNumber: "7901234567890"
licenseClass: "A1"
```

---

## ✨ Các tính năng

| Tính năng | Status | Ghi chú |
|----------|--------|--------|
| Chụp ảnh từ camera | ✅ | Real implementation |
| Chọn ảnh từ thư viện | ✅ | Real implementation |
| FPT.AI API call | ✅ | Production ready |
| Auto-fill form | ✅ | Dynamic field mapping |
| Loading indicator | ✅ | User feedback |
| Error handling | ✅ | Graceful errors |
| Permission requests | ✅ | Auto request |
| Base64 conversion | ✅ | Using expo-file-system |

---

## 🚀 Cách Test Ngay Bây Giờ

### Step 1: Chạy App
```bash
npm start
```
- Chọn `w` cho web, hoặc scan QR cho mobile
- App load

### Step 2: Test Flow
1. Chọn xe từ list
2. Chọn ngày
3. Click "Tiếp tục" → Tới Contract
4. Click "Tải ảnh" trên một document field
5. Chọn "Chụp ảnh" hoặc "Chọn từ thư viện"
6. Chụp/chọn ảnh
7. Xem form auto-fill

### Step 3: Verify Results
- ✅ Loading indicator xuất hiện
- ✅ Form fields được điền thông tin
- ✅ Alert "Thành công" hiện lên
- ❌ Nếu lỗi → Kiểm tra error message

---

## 🔧 Troubleshooting

### Nếu gặp lỗi "API key not configured"
```
→ Check: EXPO_PUBLIC_FPT_AI_API_KEY trong .env
→ Giá trị: Dl9yb4Es3qN3qXwUKUuKYdWBohbS9JP5
→ Nếu không có → Thêm vào .env
```

### Nếu Camera không hoạt động
```
→ App cần permission camera
→ Trên device: Settings → App → Camera → Allow
→ Hoặc xóa app & reinstall
```

### Nếu Photo library không hoạt động
```
→ Check permissions: Photos
→ Settings → App → Photos → Allow
```

### Nếu FPT.AI không nhận diện
```
→ Ảnh phải rõ ràng, không bị mờ
→ Ảnh phải chứa toàn bộ tài liệu
→ Thử chụp lại với ánh sáng tốt hơn
→ Check internet connection
```

### Nếu Loading bị stuck
```
→ Có thể FPT.AI API chậm
→ Chờ thêm 30 giây
→ Nếu vẫn không được → Restart app
→ Check console.log để xem error
```

---

## 📁 File Structure

```
RentRide/
├── lib/
│   └── ocr.ts (UPDATED)
│       ├── extractDataFromFPTAI()
│       └── convertImageToBase64()
├── utils/
│   └── pickImage.ts (UPDATED)
│       ├── pickImage()
│       └── takePhoto()
├── app/
│   └── vehicle/
│       └── contract.tsx (UPDATED)
│           └── handleUploadDocument() now uses real image picker
├── .env (UPDATED)
│   └── EXPO_PUBLIC_FPT_AI_API_KEY
└── Guides/
    ├── TEST_OCR_GUIDE.md (NEW)
    ├── FPT_AI_SETUP.md (NEW)
    └── FPT_AI_INTEGRATION_SUMMARY.md (NEW)
```

---

## 🎓 Hiểu Quy Trình

```
[User clicks "Tải ảnh"]
        ↓
[Alert: "Chụp ảnh" | "Chọn từ thư viện"]
        ↓
[takePhoto() hoặc pickImage()]
        ↓
[Ảnh được chọn → imageUri]
        ↓
[convertImageToBase64(imageUri)]
        ↓
[Ảnh được convert sang base64]
        ↓
[extractDataFromFPTAI(base64, documentType)]
        ↓
[POST request tới FPT.AI API]
        ↓
[FPT.AI trả về extracted data]
        ↓
[setUserData() update form fields]
        ↓
[Loading indicator ẩn đi]
        ↓
[Alert "Thành công"]
```

---

## 📝 Checklist Setup Hoàn Tất

- ✅ FPT.AI API key configured
- ✅ Dependencies installed (axios, expo-file-system)
- ✅ Image picker integrated (takePhoto, pickImage)
- ✅ OCR service created (lib/ocr.ts)
- ✅ Contract page updated with real image picker
- ✅ Loading indicator added
- ✅ Error handling implemented
- ✅ Documentation created

---

## 🎉 Ready to Test!

**Chương trình đã sẵn sàng để test OCR & upload ảnh.**

Hãy:
1. Run `npm start`
2. Navigate tới Contract page
3. Click "Tải ảnh"
4. Chọn camera hoặc thư viện
5. Chụp/chọn ảnh
6. Xem form auto-fill!

---

## 📞 Support

Nếu gặp vấn đề:
1. Check console logs (F12)
2. Xem file `.env` có API key không
3. Restart app
4. Check internet connection
5. Kiểm tra ảnh chất lượng

Good luck! 🚀
