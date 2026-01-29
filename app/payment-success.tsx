import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Text, View } from "react-native";

export default function PaymentSuccess() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const hasRedirected = useRef(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (hasRedirected.current) return;
    hasRedirected.current = true;

    const updateContractAndNavigate = async () => {
      try {
        setIsUpdating(true);

        // Lấy VNPay response code
        const responseCode = params.vnp_ResponseCode as string;
        const txnRef = params.vnp_TxnRef as string;

        console.log("Payment Success - VNPay Params:", {
          responseCode,
          txnRef,
          allParams: params,
        });

        // Kiểm tra thanh toán thành công (responseCode = 00)
        if (responseCode !== "00") {
          Alert.alert(
            "Thanh toán thất bại",
            "Giao dịch không thành công. Vui lòng thử lại.",
            [
              {
                text: "OK",
                onPress: () => {
                  router.back(); // Quay lại trang hợp đồng
                },
              },
            ],
          );
          return;
        }

        // Extract orderId từ vnp_TxnRef (should be the same as orderId)
        const orderId = txnRef as string;

        console.log("Extracted orderId:", orderId);

        if (orderId) {
          console.log("Updating contract status for orderId:", orderId);
          // Call Cloud Function to update contract status
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
        } else {
          console.warn("orderId is empty or undefined");
        }

        // ĐỢI ROUTER READY (BẮT BUỘC)
        setTimeout(() => {
          Alert.alert("Thành công", "Thanh toán thành công 🎉", [
            {
              text: "OK",
              onPress: () => {
                router.replace("/"); // Quay lại trang chủ
              },
            },
          ]);
        }, 0);
      } catch (error) {
        console.error("Error updating contract status:", error);
        Alert.alert(
          "Cảnh báo",
          "Thanh toán thành công nhưng không cập nhật được trạng thái. Vui lòng kiểm tra lịch sử.",
          [
            {
              text: "OK",
              onPress: () => {
                router.replace("/");
              },
            },
          ],
        );
      } finally {
        setIsUpdating(false);
      }
    };

    updateContractAndNavigate();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>
        {isUpdating ? "Đang xử lý thanh toán..." : "Thanh toán thành công!"}
      </Text>
    </View>
  );
}
