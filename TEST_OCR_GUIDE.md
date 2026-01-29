# Hướng dẫn Test FPT.AI API & Upload Ảnh

## 🎯 Những gì cần chuẩn bị

### 1. ✅ API Key (Đã configure)
```
EXPO_PUBLIC_FPT_AI_API_KEY=Dl9yb4Es3qN3qXwUKUuKYdWBohbS9JP5
```
- API key đã được thêm vào `.env`
- Kiểm tra: https://dashboard.fpt.ai/ nếu cần generate key mới

### 2. ✅ Dependencies (Đã install)
```bash
✓ axios - Gọi FPT.AI API
✓ expo-file-system - Đọc ảnh từ storage
✓ expo-image-picker - Chọn/chụp ảnh
```

### 3. ✅ Permissions (Tự động request)
- Camera permission - Khi chụp ảnh
- Photo library permission - Khi chọn từ thư viện

---

## 🚀 Cách Test

### Step 1: Chạy app
```bash
npm start
```

### Step 2: Navigate tới Contract Page
1. Chọn xe từ danh sách
2. Chọn ngày thuê/trả
3. Click "Tiếp tục" → Đến trang Contract

### Step 3: Upload Ảnh & Test OCR

**Chọn một trong 3 loại tài liệu:**

#### A. CMND/CCCD (Mặt trước)
1. Click nút "Tải ảnh" ở "CMND/CCCD (Mặt trước)"
2. Dialog xuất hiện với 2 option:
   - **Chụp ảnh**: Mở camera
   - **Chọn từ thư viện**: Chọn ảnh có sẵn
3. Chọp/chọn ảnh rõ ràng của CMND/CCCD mặt trước
4. Ứng dụng sẽ:
   - Hiển thị loading indicator "Đang nhận diện tài liệu..."
   - Gọi FPT.AI API
   - Tự động điền: **Họ và tên**, **Số CMND/CCCD**, **Ngày sinh**
5. Nếu thành công → Alert "Thông tin đã được tự động điền từ ảnh"

#### B. CMND/CCCD (Mặt sau)
1. Click nút "Tải ảnh" ở "CMND/CCCD (Mặt sau)"
2. Chụp/chọn ảnh mặt sau của CMND/CCCD
3. App sẽ trích xuất: **Số CMND/CCCD**

#### C. Bằng lái xe
1. Click nút "Tải ảnh" ở "Bằng lái xe"
2. Chụp/chọn ảnh bằng lái xe
3. App sẽ trích xuất:
   - **Họ và tên**
   - **Số bằng lái**
   - **Hạng bằng lái** (tự động điền dropdown)

---

## 📊 Kết quả mong đợi

### Thành công ✅
```
Loading indicator hiệu ứng 2-3 giây
↓
Alert "Thành công - Thông tin đã được tự động điền từ ảnh"
↓
Form fields được auto-fill:
- Họ và tên
- Số CMND/CCCD
- Hạng bằng lái (nếu là bằng lái)
- Ngày sinh (nếu là CMND/CCCD mặt trước)
```

### Lỗi có thể gặp ❌
1. **"API key not configured"** 
   - → Check `.env` có `EXPO_PUBLIC_FPT_AI_API_KEY` không

2. **"Không thể nhận diện ảnh"**
   - → Ảnh chưa rõ ràng, thử chụp lại
   - → Ảnh bị xoay, thử chụp đúng hướng
   - → API quota hết, chờ hoặc nâng cấp

3. **"Network error"**
   - → Check internet connection
   - → Check VPN có block FPT.AI không

4. **Permissions denied**
   - → Cho phép quyền camera/photo
   - → Settings → App → Permissions

---

## 🔍 Ảnh mẫu để test

Có thể dùng ảnh thực của CMND/CCCD hoặc bằng lái, hoặc:

### Test với ảnh từ thư viện
1. Tạo thư mục `/test-images/` trong project
2. Thêm ảnh CMND/CCCD, mặt sau, bằng lái
3. Click "Chọn từ thư viện"

### Test nhanh với Postman (Optional)
```
POST https://api.fpt.ai/vision/idr/recognize
Headers: api-key: Dl9yb4Es3qN3qXwUKUuKYdWBohbS9JP5
Body JSON:
{
  "image": "base64_encoded_image",
  "format_type": "IDENTITY_CARD"
}
```

---

## 📱 Quy trình hoàn chỉnh

```
App Start
  ↓
Navigate đến Contract Page
  ↓
Upload 3 loại tài liệu:
  ├─ CMND/CCCD Mặt trước (Bắt buộc)
  ├─ CMND/CCCD Mặt sau (Tuỳ chọn)
  └─ Bằng lái xe (Bắt buộc)
  ↓
Form auto-fill từ OCR
  ├─ fullName, phone, address, cccdNumber
  └─ licenseClass (từ bằng lái)
  ↓
Điền thêm thông tin còn thiếu
  ├─ Số điện thoại
  ├─ Địa chỉ
  └─ Hạng bằng lái (nếu OCR không nhận diện)
  ↓
Tích vào "Điều khoản sử dụng"
  ↓
Click "Tiếp tục"
```

---

## 🛠️ Troubleshooting

### Lỗi: "Cannot find module expo-file-system"
```bash
npm install expo-file-system
```

### Lỗi: Image không được load
- Kiểm tra permissions đã được cấp không
- Restart app
- Xóa cache: `expo start -c`

### Lỗi: FPT.AI trả về error code khác 0
- Kiểm tra API key còn valid không
- Kiểm tra format ảnh (JPEG, PNG)
- Kiểm tra ảnh có hết hạn không

### Loading indicator bị stuck
- Check network: FPT.AI API có respond không
- Logs: Xem console.log error messages
- Timeout: Chờ khoảng 30 giây rồi retry

---

## 📝 Logs để debug

Mở browser DevTools (nếu web) hoặc console terminal để xem:

```
[OCR Processing] Converting image to base64...
[OCR Processing] Calling FPT.AI API...
[OCR Processing] Response received: {...}
[OCR Processing] Data extracted: {...}
```

---

## ✨ Các tính năng đã integrate

✅ Real image picker (camera & gallery)
✅ FPT.AI Vision API integration
✅ Auto-fill form từ OCR
✅ Loading indicator
✅ Error handling
✅ Permission requests
✅ Base64 image conversion

---

## 🚀 Next Steps (Optional)

1. **Production Security**
   - Di chuyển API call vào backend
   - Bảo vệ API key trên server

2. **Image Compression**
   - Compress ảnh trước khi gửi FPT.AI
   - Giảm network usage

3. **Offline Support**
   - Cache extracted data
   - Fallback khi offline

4. **Data Validation**
   - Validate phone number format
   - Verify CCCD format
   - Check license class valid

5. **Analytics**
   - Track OCR success rate
   - Monitor API usage
   - Log errors for analytics
