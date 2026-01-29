import { Text, View } from "react-native";

export default function PaymentResultModal() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-xl font-bold text-green-600">
        Thanh toán đang được xử lý
      </Text>
    </View>
  );
}
