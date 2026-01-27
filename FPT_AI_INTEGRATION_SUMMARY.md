# FPT.AI Vision API Integration - Implementation Summary

## Những gì đã được tích hợp

### 1. **Thư viện OCR Service** (`lib/ocr.ts`)

- `extractDataFromFPTAI()` - Hàm gọi FPT.AI Vision API
  - Nhận image base64 và loại tài liệu
  - Gửi request tới FPT.AI endpoint
  - Xử lý response và trích xuất dữ liệu
  - Trả về object với các trường đã trích xuất
- `convertImageToBase64()` - Chuyển đổi ảnh sang base64
  - Hỗ trợ ảnh local từ camera
  - Xử lý lỗi khi ảnh không khả dụng

### 2. **Contract Screen Updates** (`app/vehicle/contract.tsx`)

- Import FPT.AI service và ActivityIndicator component
- Thêm state `isProcessingOCR` để theo dõi quá trình xử lý
- Thay thế mock OCR bằng real FPT.AI API call
  - `extractDataFromImage()` giờ là async function
  - Hiển thị loading indicator khi đang xử lý
  - Xử lý lỗi một cách graceful
- Thêm OCR Loading Indicator
  - Overlay đen khi đang xử lý
  - Spinning loader + message "Đang nhận diện tài liệu..."

### 3. **Environment Configuration** (`.env`)

- Thêm `EXPO_PUBLIC_FPT_AI_API_KEY` config
- Template hướng dẫn cách lấy API key

### 4. **Dependencies Installed**

- `axios` - Gọi HTTP requests tới FPT.AI API
- `expo-file-system` - Đọc file ảnh từ storage để chuyển base64

## Quy trình làm việc

### Bước 1: Người dùng chọn ảnh

```
User taps "Chụp ảnh" → Alert dialog shows
```

### Bước 2: OCR Processing

```
Ảnh được chọn
  → Convert to base64
  → Call FPT.AI Vision API
  → Loading indicator shows
```

### Bước 3: Data Auto-fill

```
FPT.AI returns extracted data
  → userData state updated
  → Form fields auto-filled
  → Loading indicator hidden
  → Success alert shown
```

## Dữ liệu được trích xuất

### CMND/CCCD (Mặt trước)

- `fullName` - Họ và tên
- `cccdNumber` - Số CMND/CCCD
- `dob` - Ngày sinh (nếu có)

### CMND/CCCD (Mặt sau)

- `cccdNumber` - Số CMND/CCCD

### Bằng lái xe

- `fullName` - Họ và tên
- `licenseNumber` - Số bằng lái
- `licenseClass` - Hạng bằng lái (A1, A2, A, B1, B2, B, C, D, E)

## API Endpoint Configuration

- **Endpoint**: `https://api.fpt.ai/vision/idr/recognize`
- **Method**: POST
- **Headers**:
  - `api-key`: FPT.AI API key
  - `Content-Type`: application/json
- **Payload**:
  ```json
  {
    "image": "base64_encoded_image",
    "format_type": "IDENTITY_CARD" | "DRIVER_LICENSE"
  }
  ```

## Error Handling

App handles các trường hợp lỗi sau:

- API key not configured → Error message
- Network error → Try again prompt
- Invalid image → Re-upload suggestion
- API rate limit → Graceful retry message

## Next Steps (Tuỳ chọn)

1. **Real Image Picker**
   - Thay thế mock image bằng `expo-image-picker`
   - Thêm permissions handling

2. **Cloudinary Integration**
   - Upload ảnh lên Cloudinary trước
   - Gửi Cloudinary URL tới FPT.AI

3. **Backend Security**
   - Tạo backend endpoint để call FPT.AI
   - Bảo vệ API key trên server
   - Client chỉ gửi image, backend xử lý OCR

4. **Data Validation**
   - Validate extracted data
   - Double-check phone/email format
   - Verify CCCD number format

5. **Caching**
   - Cache extracted data
   - Avoid re-processing same image

6. **Analytics**
   - Track OCR success rate
   - Monitor API usage
   - Log errors for debugging

## Testing

### Để test FPT.AI integration:

1. Cấu hình FPT.AI API key vào `.env`
2. Chạy app: `npm start`
3. Navigate tới contract page
4. Nhấn "Tải ảnh" trên mỗi document field
5. Chọn "Mô phỏng OCR" (đang dùng mock image)
6. Xem form fields được auto-fill

## Lưu ý bảo mật

⚠️ **QUAN TRỌNG**:

- Không commit `.env` file lên git
- API key nên được bảo vệ trên server
- Xem xét di chuyển logic OCR vào backend (Firebase Functions)
- Không lưu API key trong code client khi production

## File Structure

```
RentRide/
├── lib/
│   ├── ocr.ts (NEW) - FPT.AI service
│   └── firebase/
├── app/
│   └── vehicle/
│       └── contract.tsx (UPDATED)
├── .env (UPDATED)
├── package.json (UPDATED)
└── FPT_AI_SETUP.md (NEW)
```

## Status: ✅ COMPLETED

FPT.AI Vision API đã được tích hợp thành công. Ứng dụng giờ có thể:

- Gọi FPT.AI API để nhận diện ảnh
- Tự động điền thông tin từ ảnh
- Hiển thị loading indicator khi xử lý
- Xử lý lỗi một cách graceful
