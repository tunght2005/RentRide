import { useAuth } from "@/hooks/useAuth";
import { usePaymentLink } from "@/hooks/usePaymentLink";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { convertImageToBase64, extractDataFromFPTAI } from "../../lib/ocr";
import { uploadImageToCloudinary } from "../../lib/upload";
import { pickImage } from "../../utils/pickImage";

// Available driver license classes used by the picker
const LICENSE_CLASSES = ["A1", "A2", "A3", "B1", "B2", "C", "D", "E", "F"];

// Upload UI Component
const UploadUI = () => (
  <View className="items-center justify-center">
    <Ionicons name="cloud-upload-outline" size={40} color="#999" />
    <Text className="text-center text-gray-500 font-medium mt-2">
      Nhấn để tải ảnh
    </Text>
  </View>
);

export default function ContractScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();

  const [idFrontImage, setIdFrontImage] = useState<string | null>(null);
  const [idBackImage, setIdBackImage] = useState<string | null>(null);
  const [licenseImage, setLicenseImage] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>({
    fullName: "",
    phone: "",
    address: "",
    dob: "",
    permanentAddress: "",
    cccdNumber: "",
    licenseNumber: "",
    licenseClass: "",
    email: "",
  });
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [showLicenseClassPicker, setShowLicenseClassPicker] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { createPayment } = usePaymentLink();

  // Kiểm tra thanh toán thành công khi quay lại trang (Real-time với window focus)
  useEffect(() => {
    if (Platform.OS !== "web") return;

    const checkPaymentStatus = () => {
      const paymentSuccess = localStorage.getItem("payment_success");

      if (paymentSuccess === "true") {
        // Hiển thị thông báo
        Alert.alert(
          "Thanh toán thành công! 🎉",
          "Hợp đồng của bạn đã được xác nhận và lưu vào hệ thống.",
          [
            {
              text: "Về trang chủ",
              onPress: () => {
                localStorage.removeItem("payment_success");
                router.replace("/");
              },
            },
          ],
        );
      }
    };

    // Check ngay khi mount
    checkPaymentStatus();

    // Listen window focus event - khi tab được focus lại sau khi payment-success đóng
    const handleFocus = () => {
      checkPaymentStatus();
    };

    window.addEventListener("focus", handleFocus);

    // Cleanup
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  useEffect(() => {
    if (!params.startDate || !params.endDate) return;

    setBookingData({
      startDate: new Date(params.startDate as string),
      endDate: new Date(params.endDate as string),
      totalPrice: Number(params.totalPrice),
      rentalDays: Number(params.rentalDays),
      pricePerDay: Number(params.pricePerDay),
    });
  }, [
    params.startDate,
    params.endDate,
    params.totalPrice,
    params.rentalDays,
    params.pricePerDay,
  ]);

  useEffect(() => {
    setVehicleData({
      images: params.vehicleImage,
      name: params.vehicleName || "",
      brand: params.vehicleBrand || "",
      year: Number(params.vehicleYear) || undefined, // Chuyển đổi sang số
      licensePlate: params.licensePlate || "", // Lấy từ params
    });
  }, [
    params.vehicleName,
    params.vehicleBrand,
    params.vehicleYear,
    params.licensePlate,
    params.vehicleImage,
  ]);

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // FPT.AI OCR function - tự động điền thông tin từ ảnh
  // const extractDataFromImage = async (
  //   imageUri: string,
  //   documentType: "idFront" | "idBack" | "license",
  // ) => {
  //   try {
  //     setIsProcessingOCR(true);

  //     // Convert image to base64
  //     const imageBase64 = await convertImageToBase64(imageUri);

  //     // Call FPT.AI Vision API
  //     const extractedData = await extractDataFromFPTAI(
  //       imageBase64,
  //       documentType,
  //     );

  //     // Auto-fill user data
  //     setUserData((prev: any) => ({
  //       ...prev,
  //       ...extractedData,
  //     }));

  //     Alert.alert("Thành công", "Thông tin đã được tự động điền từ ảnh");
  //   } catch (error: any) {
  //     console.error("OCR Error:", error);
  //     Alert.alert(
  //       "Lỗi",
  //       error.message || "Không thể nhận diện ảnh. Vui lòng thử lại.",
  //     );
  //   } finally {
  //     setIsProcessingOCR(false);
  //   }
  // };
  //Thanh toán
  const handleContinue = async () => {
    try {
      if (!user?.uid) {
        Alert.alert("Lỗi", "Vui lòng đăng nhập trước");
        return;
      }

      setIsProcessingPayment(true);

      const contractPayload = {
        user: {
          fullName: userData.fullName,
          phone: userData.phone,
          email: user.email || "",
          address: userData.address,
          dob: userData.dob,
          cccdNumber: userData.cccdNumber,
          permanentAddress: userData.permanentAddress,
          licenseNumber: userData.licenseNumber,
          licenseClass: userData.licenseClass,
        },

        documents: {
          idFrontImage: idFrontImage || "",
          idBackImage: idBackImage || "",
          licenseImage: licenseImage || "",
        },

        vehicle: {
          id: Array.isArray(params.vehicleId)
            ? params.vehicleId[0]
            : params.vehicleId,
          name: vehicleData.name,
          brand: vehicleData.brand,
          year: vehicleData.year,
          licensePlate: vehicleData.licensePlate,
          image: vehicleData.images,
        },

        booking: {
          startDate: bookingData.startDate.toISOString(),
          endDate: bookingData.endDate.toISOString(),
          rentalDays: bookingData.rentalDays,
          pricePerDay: bookingData.pricePerDay,
          totalPrice: bookingData.totalPrice,
        },

        userId: user.uid,
      };

      const paymentUrl = await createPayment(contractPayload);
      setIsProcessingPayment(false);

      if (typeof window !== "undefined") {
        window.location.replace(paymentUrl);
      } else {
        Linking.openURL(paymentUrl);
      }
    } catch (e) {
      setIsProcessingPayment(false);
      console.error("Payment error:", e);
      Alert.alert("Lỗi", "Không thể tạo thanh toán. Vui lòng thử lại.");
    }
  };

  const handleImageSelection = async (
    imageUri: string,
    documentType: "idFront" | "idBack" | "license",
  ) => {
    try {
      // KHÔNG OCR mặt sau
      if (documentType !== "idBack") {
        setIsProcessingOCR(true);
        const base64 = await convertImageToBase64(imageUri);
        //("Đang nhận diện...")
        const extractedData = await extractDataFromFPTAI(base64, documentType);

        setUserData((prev: any) => ({
          ...prev,
          ...extractedData,
        }));
      }

      // Show "Đang tải ảnh lên..." spinner
      setIsUploadingImage(true);
      const cloudinaryUrl = await uploadImageToCloudinary(imageUri);

      if (documentType === "idFront") {
        setIdFrontImage(cloudinaryUrl);
      }

      if (documentType === "idBack") {
        setIdBackImage(cloudinaryUrl);
      }

      if (documentType === "license") {
        setLicenseImage(cloudinaryUrl);
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Xử lý ảnh thất bại");
    } finally {
      setIsProcessingOCR(false);
      setIsUploadingImage(false);
    }
  };

  const handleUploadDocument = async (
    documentType: "idFront" | "idBack" | "license",
  ) => {
    try {
      const imageUri = await pickImage();
      if (!imageUri) return;

      await handleImageSelection(imageUri, documentType);
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể chọn ảnh");
    }
  };

  const isFormValid = () => {
    return (
      userData?.fullName?.trim() &&
      userData?.phone?.trim() &&
      userData?.address?.trim() &&
      userData?.cccdNumber?.trim() &&
      idFrontImage &&
      licenseImage &&
      agreedToTerms
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View className="flex-row items-center px-4 pt-4 pb-3 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>

        <Text className="text-lg font-bold ml-2 flex-1">
          Thông tin & Hợp đồng
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* DOCUMENTS SECTION */}
        <View className="mb-8 px-4 pt-4">
          <View className="flex-row items-center gap-2 mb-6">
            <Ionicons name="document-text" size={24} color="#EC4899" />
            <Text className="text-lg font-bold text-black">
              Tài liệu giấy tờ
            </Text>
          </View>

          {/* ID FRONT */}
          <Text className="font-bold mb-2 text-black">
            CMND/CCCD (Mặt trước) *
          </Text>
          <TouchableOpacity
            onPress={() => handleUploadDocument("idFront")}
            className="border border-dashed border-gray-300 bg-white rounded-xl h-36 items-center justify-center mb-6"
          >
            {idFrontImage ? (
              <Image
                source={{ uri: idFrontImage }}
                className="w-full h-full rounded-xl"
                resizeMode="cover"
              />
            ) : (
              <UploadUI />
            )}
          </TouchableOpacity>

          {/* ID BACK */}
          <Text className="font-bold mt-2 mb-2 text-black">
            CMND/CCCD (Mặt sau)
          </Text>
          <TouchableOpacity
            onPress={() => handleUploadDocument("idBack")}
            className="border border-dashed border-gray-300 bg-white rounded-xl h-36 items-center justify-center mb-6"
          >
            {idBackImage ? (
              <Image
                source={{ uri: idBackImage }}
                className="w-full h-full rounded-xl"
                resizeMode="cover"
              />
            ) : (
              <UploadUI />
            )}
          </TouchableOpacity>

          {/* DRIVER LICENSE */}
          <Text className="font-bold mt-2 mb-2 text-black">Bằng lái xe *</Text>
          <TouchableOpacity
            onPress={() => handleUploadDocument("license")}
            className="border border-dashed border-gray-300 bg-white rounded-xl h-36 items-center justify-center mb-6"
          >
            {licenseImage ? (
              <Image
                source={{ uri: licenseImage }}
                className="w-full h-full rounded-xl"
                resizeMode="cover"
              />
            ) : (
              <UploadUI />
            )}
          </TouchableOpacity>
        </View>

        <View className="px-4">
          {/* INFORMATION  */}
          <View className="mb-8">
            <View className="flex-row items-center gap-2 mb-6">
              <Ionicons name="person" size={24} color="#EC4899" />
              <Text className="text-lg font-bold text-black">
                Thông tin cá nhân
              </Text>
            </View>

            {/* FULL NAME */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-black mb-2">
                Họ và tên *
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-white">
                <Ionicons name="person-outline" size={20} color="#999" />
                <TextInput
                  value={userData?.fullName || ""}
                  onChangeText={(text) =>
                    setUserData((prev: any) => ({
                      ...prev,
                      fullName: text,
                    }))
                  }
                  editable={true}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor="#CCCCCC"
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 16,
                    color: "#000",
                  }}
                />
              </View>
            </View>

            {/* PHONE */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-black mb-2">
                Số điện thoại *
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-white">
                <Ionicons name="call-outline" size={20} color="#999" />
                <TextInput
                  editable={true}
                  value={userData?.phone || ""}
                  onChangeText={(text) =>
                    setUserData((prev: any) => ({
                      ...prev,
                      phone: text,
                    }))
                  }
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor="#CCCCCC"
                  keyboardType="phone-pad"
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 16,
                    color: "#000",
                  }}
                />
              </View>
            </View>

            {/* ADDRESS */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-black mb-2">
                Địa chỉ hiện tại*
              </Text>
              <View className="flex-row items-start border border-gray-300 rounded-xl px-4 py-3 bg-white">
                <Ionicons
                  name="location-outline"
                  size={20}
                  color="#999"
                  style={{ marginTop: 8 }}
                />
                <TextInput
                  value={userData?.address || ""}
                  onChangeText={(text) =>
                    setUserData((prev: any) => ({
                      ...prev,
                      address: text,
                    }))
                  }
                  editable={true}
                  multiline
                  placeholder="Nhập địa chỉ"
                  placeholderTextColor="#CCCCCC"
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 16,
                    color: "#000",
                    minHeight: 60,
                  }}
                />
              </View>
            </View>

            {/* CCCD NUMBER */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-black mb-2">
                Số CMND/CCCD
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-white">
                <Ionicons name="card-outline" size={20} color="#999" />
                <TextInput
                  value={userData?.cccdNumber || ""}
                  onChangeText={(text) =>
                    setUserData((prev: any) => ({
                      ...prev,
                      cccdNumber: text,
                    }))
                  }
                  editable={true}
                  placeholder="Nhập số CMND/CCCD"
                  placeholderTextColor="#CCCCCC"
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 16,
                    color: "#000",
                  }}
                />
              </View>
            </View>
            <Text className="text-sm font-semibold mb-2">Địa chỉ CCCD*</Text>
            <View className="flex-row items-start border border-gray-300 rounded-xl px-4 py-3 bg-white">
              <Ionicons
                name="location-outline"
                size={20}
                color="#999"
                style={{ marginTop: 8 }}
              />
              <TextInput
                value={userData.permanentAddress}
                onChangeText={(text) =>
                  setUserData((prev: any) => ({
                    ...prev,
                    permanentAddress: text,
                  }))
                }
                editable={false}
                multiline
                placeholder="Theo CCCD đã quét"
                placeholderTextColor="#CCCCCC"
              />
            </View>
            {/* Ngày sinh */}
            <Text className="text-sm font-semibold mb-2">Ngày sinh</Text>
            <TextInput
              value={userData.dob}
              editable={false}
              className="border border-gray-300 rounded-xl px-4 py-3 bg-gray-100"
            />

            {/* GPLX NUMBER */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-black mb-2">
                Số ID GPLX
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-white">
                <Ionicons name="card-outline" size={20} color="#999" />
                <TextInput
                  value={userData?.licenseNumber || ""}
                  onChangeText={(text) =>
                    setUserData((prev: any) => ({
                      ...prev,
                      licenseNumber: text,
                    }))
                  }
                  editable={true}
                  placeholder="Nhập số GPLX"
                  placeholderTextColor="#CCCCCC"
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 16,
                    color: "#000",
                  }}
                />
              </View>
            </View>
            {/* LICENSE INFORMATION */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-black mb-2">
                Hạng bằng lái
              </Text>
              <TouchableOpacity
                onPress={() => setShowLicenseClassPicker(true)}
                className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-white"
              >
                <Ionicons name="document-outline" size={20} color="#999" />
                <Text
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 16,
                    color: userData?.licenseClass ? "#000" : "#CCC",
                  }}
                >
                  {userData?.licenseClass || "Chọn hạng bằng lái"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#999" />
              </TouchableOpacity>
            </View>
          </View>

          {/* VEHICLE INFORMATION  */}
          <View className="mb-8">
            <View className="flex-row items-center gap-2 mb-6">
              <Ionicons name="car-outline" size={24} color="#3B82F6" />
              <Text className="text-lg font-bold text-black">Thông tin xe</Text>
            </View>

            {/* VEHICLE NAME */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-black mb-2">
                Tên xe
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-blue-50">
                <Ionicons name="car-outline" size={20} color="#3B82F6" />
                <TextInput
                  value={vehicleData?.name || ""}
                  editable={false}
                  className="flex-1 ml-3 text-black font-medium"
                />
              </View>
            </View>

            {/* VEHICLE YEAR */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-black mb-2">
                Năm sản xuất
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-blue-50">
                <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
                <TextInput
                  value={String(vehicleData?.year || "")}
                  editable={false}
                  className="flex-1 ml-3 text-black font-medium"
                />
              </View>
            </View>

            {/* LICENSE PLATE */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-black mb-2">
                Biển số xe
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-blue-50">
                <Ionicons name="barcode-outline" size={20} color="#3B82F6" />
                <TextInput
                  value={vehicleData?.licensePlate || ""}
                  editable={false}
                  className="flex-1 ml-3 text-black font-medium"
                />
              </View>
            </View>
          </View>

          {/* CONTRACT SUMMARY */}
          <View className="mb-8 bg-white rounded-xl border border-gray-200 p-4">
            <View className="flex-row items-center gap-2 mb-6">
              <View className="w-6 h-6 rounded-full bg-green-100 items-center justify-center">
                <Ionicons name="checkmark" size={16} color="#10B981" />
              </View>
              <Text className="text-lg font-bold text-black">
                Tóm tắt hợp đồng
              </Text>
            </View>

            {/* VEHICLE CARD */}
            <View className="flex-row items-start gap-4 mb-6 pb-6 border-b border-gray-200">
              <Image
                source={{ uri: vehicleData?.images }}
                className="w-20 h-20 rounded-lg bg-gray-100"
              />
              <View className="flex-1">
                <Text className="text-base font-bold text-black">
                  {vehicleData?.name}
                </Text>
                <Text className="text-sm text-gray-600 mt-1">
                  {vehicleData?.brand}
                </Text>
              </View>
            </View>

            {/* BOOKING DETAILS */}
            <View className="mb-6 space-y-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600 text-sm">Ngày bắt đầu</Text>
                <Text className="font-semibold text-black">
                  {bookingData
                    ? formatDate(bookingData.startDate)
                    : "27/01/2026"}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600 text-sm">Ngày kết thúc</Text>
                <Text className="font-semibold text-black">
                  {bookingData ? formatDate(bookingData.endDate) : "29/01/2026"}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600 text-sm">Số ngày thuê</Text>
                <Text className="font-semibold text-black">
                  {bookingData ? `${bookingData.rentalDays} ngày` : "2 ngày"}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600 text-sm">Đơn giá</Text>
                <Text className="font-semibold text-black">
                  {bookingData
                    ? `${bookingData.pricePerDay.toLocaleString()} đ/ngày`
                    : "1.200.000 đ/ngày"}
                </Text>
              </View>
            </View>

            {/* TOTAL PRICE */}
            <View className="flex-row justify-between items-center pt-6 border-t border-gray-200">
              <Text className="font-bold text-black">Tổng tiền</Text>
              <Text className="text-2xl font-bold text-pink-600">
                {bookingData
                  ? `${bookingData.totalPrice.toLocaleString()} đ`
                  : "2.400.000 đ"}
              </Text>
            </View>
          </View>

          {/* TERMS OF USE SECTION */}
          <View className="mb-8">
            <Text className="text-lg font-bold text-black mb-4">
              Điều khoản sử dụng
            </Text>

            <View className="space-y-3 mb-6">
              <View className="flex-row gap-3">
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#10B981"
                  style={{ marginTop: 2 }}
                />
                <Text className="text-sm text-gray-700 flex-1 leading-5">
                  Xe phải được trả đúng thời gian đã thỏa thuận
                </Text>
              </View>

              <View className="flex-row gap-3">
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#10B981"
                  style={{ marginTop: 2 }}
                />
                <Text className="text-sm text-gray-700 flex-1 leading-5">
                  Không sử dụng xe vào mục đích phi pháp
                </Text>
              </View>

              <View className="flex-row gap-3">
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#10B981"
                  style={{ marginTop: 2 }}
                />
                <Text className="text-sm text-gray-700 flex-1 leading-5">
                  Người thuê chịu trách nhiệm về mọi hư hỏng trong thời gian
                  thuê
                </Text>
              </View>

              <View className="flex-row gap-3">
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#10B981"
                  style={{ marginTop: 2 }}
                />
                <Text className="text-sm text-gray-700 flex-1 leading-5">
                  Trả 100% giá tiền thuê xe
                </Text>
              </View>
            </View>

            {/* AGREEMENT CHECKBOX */}
            <TouchableOpacity
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              className="bg-pink-50 rounded-xl p-4 flex-row items-start gap-3"
            >
              <View
                className={`w-6 h-6 rounded border-2 items-center justify-center mt-1 ${
                  agreedToTerms
                    ? "bg-pink-600 border-pink-600"
                    : "border-pink-300"
                }`}
              >
                {agreedToTerms && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
              <Text className="text-sm text-gray-700 flex-1 leading-5">
                Tôi đồng ý với{" "}
                <Text className="font-semibold text-pink-600">
                  điều khoản và điều kiện thuê xe
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* FOOTER BUTTON */}
      <View className="px-4 pb-6 pt-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!isFormValid() || isProcessingPayment}
          className={`py-4 rounded-2xl active:opacity-80 flex-row items-center justify-center gap-2 ${
            isFormValid() && !isProcessingPayment
              ? "bg-pink-600"
              : "bg-gray-300"
          }`}
        >
          {isProcessingPayment && (
            <ActivityIndicator size="small" color="white" />
          )}
          <Text className="text-white text-center font-bold text-base">
            {isProcessingPayment ? "Đang xử lý..." : "Tiếp tục"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* LICENSE CLASS PICKER MODAL */}
      <Modal
        visible={showLicenseClassPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLicenseClassPicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl px-4 pt-6 pb-8">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-lg font-bold">Chọn hạng bằng lái</Text>
              <TouchableOpacity
                onPress={() => setShowLicenseClassPicker(false)}
                className="p-2"
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap gap-3">
              {LICENSE_CLASSES.map((licenseClass) => (
                <TouchableOpacity
                  key={licenseClass}
                  onPress={() => {
                    setUserData((prev: any) => ({
                      ...prev,
                      licenseClass: licenseClass,
                    }));
                    setShowLicenseClassPicker(false);
                  }}
                  className={`flex-1 min-w-20 py-3 px-4 rounded-xl border-2 items-center ${
                    userData?.licenseClass === licenseClass
                      ? "bg-pink-600 border-pink-600"
                      : "bg-gray-100 border-gray-300"
                  }`}
                >
                  <Text
                    className={`text-base font-semibold ${
                      userData?.licenseClass === licenseClass
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {licenseClass}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* UPLOAD / OCR LOADING INDICATOR */}
      {(isProcessingOCR || isUploadingImage) && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-2xl p-6 items-center">
            <ActivityIndicator size="large" color="#EC4899" />
            <Text className="mt-4 text-center text-gray-700 font-medium">
              {isUploadingImage
                ? "Đang tải ảnh lên..."
                : "Đang nhận diện tài liệu..."}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
