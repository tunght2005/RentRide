import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

export default function PaymentSuccess() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const hasRedirected = useRef(false);
  const [isUpdating, setIsUpdating] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (hasRedirected.current) return;
    hasRedirected.current = true;

    const updateContractAndNavigate = async () => {
      try {
        // Lấy VNPay response code
        const responseCode = params.vnp_ResponseCode as string;
        const txnRef = params.vnp_TxnRef as string;

        console.log("Payment Success - VNPay Params:", {
          responseCode,
          txnRef,
          allParams: params,
        });

        // Kiểm tra thanh toán thành công
        if (responseCode !== "00") {
          setPaymentStatus("error");
          setErrorMessage("Giao dịch không thành công. Vui lòng thử lại.");
          setIsUpdating(false);
          return;
        }

        // orderId từ vnp_TxnRef
        const orderId = txnRef as string;

        console.log("Extracted orderId:", orderId);

        if (orderId) {
          console.log("Updating contract status for orderId:", orderId);
          // gọi Cloud Function để cập nhật status trong fb
          const response = await fetch(
            "https://createvnpaypayment-vzdymlhokq-uc.a.run.app/updateContractStatus",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: orderId,
                status: "paid",
              }),
            },
          );

          if (!response.ok) {
            throw new Error(
              `Failed to update contract status: ${response.statusText}`,
            );
          }

          console.log("Contract status updated successfully");
          setPaymentStatus("success");

          // Set flag để hiển thị thông báo
          if (typeof window !== "undefined" && window.localStorage) {
            localStorage.setItem("payment_success", "true");
          }

          // Delay 2 giây rồi về đóng tab thanh toán rồi về trang chủ
          setTimeout(() => {
            if (typeof window !== "undefined") {
              try {
                window.close();
              } catch (e) {
                router.replace("/(tabs)/index");
              }
            }
          }, 2000);
        } else {
          setPaymentStatus("error");
          setErrorMessage("Không tìm thấy mã đơn hàng.");
        }

        setIsUpdating(false);
      } catch (error) {
        console.error("Error:", error);
        setPaymentStatus("error");
        setErrorMessage(
          "Thanh toán thành công nhưng không cập nhật được trạng thái. Vui lòng kiểm tra lịch sử.",
        );
        setIsUpdating(false);
      }
    };

    updateContractAndNavigate();
  }, []);

  const handleNavigateHome = () => {
    // Set flag trước khi navigate
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("payment_success", "true");
      window.location.href = "/";
    } else {
      router.replace("/");
    }
  };

  if (isUpdating) {
    return (
      <View className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 items-center justify-center px-4">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-lg font-semibold text-gray-800 mt-4">
          Đang xử lý thanh toán...
        </Text>
        <Text className="text-sm text-gray-600 mt-2">Vui lòng chờ</Text>
      </View>
    );
  }

  if (paymentStatus === "error") {
    return (
      <View className="flex-1 bg-gradient-to-br from-red-50 to-orange-100 items-center justify-center px-4">
        <View className="bg-white rounded-3xl p-8 items-center shadow-lg">
          <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-6">
            <Ionicons name="close-circle" size={40} color="#EF4444" />
          </View>

          <Text className="text-2xl font-bold text-gray-900 text-center">
            Lỗi Thanh Toán
          </Text>

          <Text className="text-gray-600 text-center mt-4 text-base">
            {errorMessage}
          </Text>

          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-red-600 rounded-2xl px-8 py-3 mt-8 active:opacity-80"
          >
            <Text className="text-white font-semibold text-center">
              Quay Lại
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gradient-to-br from-green-50 to-emerald-100 items-center justify-center px-4">
      <View className="bg-white rounded-3xl p-8 items-center shadow-xl max-w-sm">
        {/* Success Icon with Animation */}
        <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-6">
          <Ionicons name="checkmark-circle" size={48} color="#10B981" />
        </View>

        {/* Success Title */}
        <Text className="text-3xl font-bold text-gray-900 text-center">
          Thanh Toán Thành Công!
        </Text>

        {/* Success Message */}
        <Text className="text-gray-600 text-center mt-4 text-base leading-6">
          Hợp đồng thuê xe của bạn đã được xác nhận và lưu vào hệ thống.
        </Text>

        {/* Success Details */}
        <View className="bg-green-50 rounded-2xl p-4 mt-6 w-full">
          <View className="flex-row items-center gap-3 mb-3">
            <Ionicons name="checkmark" size={20} color="#10B981" />
            <Text className="text-gray-700 font-medium">Hợp đồng được lưu</Text>
          </View>
          <View className="flex-row items-center gap-3 mb-3">
            <Ionicons name="checkmark" size={20} color="#10B981" />
            <Text className="text-gray-700 font-medium">
              Thanh toán được xác nhận
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Ionicons name="checkmark" size={20} color="#10B981" />
            <Text className="text-gray-700 font-medium">
              Xe đã được cấp phát
            </Text>
          </View>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          onPress={handleNavigateHome}
          className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl px-8 py-4 mt-8 w-full active:opacity-80 shadow-md"
        >
          <Text className="text-white font-bold text-center text-lg">
            Về Trang Chủ
          </Text>
        </TouchableOpacity>

        {/* Additional Info */}
        <Text className="text-gray-500 text-center mt-6 text-sm">
          Bạn có thể xem chi tiết hợp đồng trong mục `Lịch sử`
        </Text>
      </View>
    </View>
  );
}
