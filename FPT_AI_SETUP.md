# FPT.AI Vision API Integration Guide

## Tổng quan
Ứng dụng đã được tích hợp FPT.AI Vision API để tự động nhận diện và trích xuất thông tin từ ảnh chứng minh thư (CMND/CCCD) và bằng lái xe.

## Cài đặt

### 1. Cài đặt dependencies
```bash
npm install axios expo-file-system
```

### 2. Cấu hình FPT.AI API Key
Thêm FPT.AI API key vào file `.env`:
```env
EXPO_PUBLIC_FPT_AI_API_KEY=your_fpt_ai_api_key_here
```

### 3. Lấy FPT.AI API Key
1. Truy cập https://dashboard.fpt.ai/
2. Đăng ký tài khoản (nếu chưa có)
3. Tạo API key cho Vision API
4. Copy API key vào file `.env`

## Cấu trúc kỹ thuật

### File OCR (`lib/ocr.ts`)
- `extractDataFromFPTAI()` - Gọi FPT.AI Vision API để nhận diện ảnh
- `convertImageToBase64()` - Chuyển đổi ảnh sang base64 để gửi tới API

### Tích hợp trong Contract Screen (`app/vehicle/contract.tsx`)
- `extractDataFromImage()` - Xử lý ảnh và gọi FPT.AI
- `isProcessingOCR` - State theo dõi quá trình xử lý
- OCR Loading Indicator - Hiển thị khi đang xử lý

## Tính năng hỗ trợ

### 1. CMND/CCCD (Mặt trước)
Trích xuất:
- Họ và tên
- Số CMND/CCCD
- Ngày sinh (nếu có)

### 2. CMND/CCCD (Mặt sau)
Trích xuất:
- Số CMND/CCCD

### 3. Bằng lái xe
Trích xuất:
- Họ và tên
- Số bằng lái
- Hạng bằng lái (A, B, C, v.v.)

## Lưu ý

1. **Chất lượng ảnh**: Ảnh cần phải:
   - Rõ ràng, không bị mờ
   - Toàn bộ tài liệu hiển thị trong ảnh
   - Ánh sáng đủ để đọc rõ thông tin

2. **Xử lý lỗi**: Nếu nhận diện thất bại:
   - Kiểm tra lại FPT.AI API key
   - Kiểm tra kết nối internet
   - Thử chụp lại ảnh chất lượng tốt hơn
   - Hãy tự điền thông tin nếu OCR không thành công

3. **Bảo mật**: API key nên được bảo vệ:
   - Không commit `.env` lên git
   - Sử dụng environment variables
   - Quản lý quyền truy cập cẩn thận

## API Response Structure (FPT.AI)

```json
{
  "error_code": 0,
  "message": "success",
  "data": {
    "name": "Nguyễn Văn A",
    "id": "0792030123456",
    "dob": "01/01/1990",
    "gender": "Male",
    "address": "...",
    "issuing_date": "...",
    "expiration_date": "...",
    "home_town": "..."
  }
}
```

## Troubleshooting

### Lỗi: "FPT.AI API key not configured"
**Giải pháp**: Kiểm tra file `.env` có chứa `EXPO_PUBLIC_FPT_AI_API_KEY` không

### Lỗi: "Remote images need to be downloaded first"
**Giải pháp**: Khi sử dụng ảnh thực từ camera, hệ thống sẽ tự động xử lý

### Lỗi: "FPT.AI API Error"
**Giải pháp**: 
- Kiểm tra API key có hợp lệ không
- Kiểm tra quota API chưa hết
- Kiểm tra định dạng ảnh được hỗ trợ (JPEG, PNG)

## Tiếp theo

Để hoàn thiện hệ thống:
1. Tích hợp image picker thực từ camera/gallery
2. Tải ảnh lên Cloudinary trước khi gửi tới FPT.AI
3. Thêm validation dữ liệu sau OCR
4. Tạo backend endpoint để bảo vệ API key (thay vì lưu trên client)
