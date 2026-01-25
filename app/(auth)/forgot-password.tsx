import { View, Text, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";

import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { resetPassword } from "../../lib/firebase/auth";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    try {
      setLoading(true);
      await resetPassword(email.trim());
      Alert.alert(
        "Thành công",
        "Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.",
      );
      router.back(); // quay lại login
    } catch (e: any) {
      Alert.alert("Lỗi", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-xl font-semibold mb-4">Quên mật khẩu</Text>

      <Text className="text-sm text-gray-500 mb-6">
        Nhập email đã đăng ký để nhận link đặt lại mật khẩu.
      </Text>

      <Input placeholder="Email" value={email} onChangeText={setEmail} />

      <Button title="Gửi email reset" onPress={handleReset} loading={loading} />
    </View>
  );
}
