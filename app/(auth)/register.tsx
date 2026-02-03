import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";

export default function RegisterScreen() {
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState<{
    title: string;
    message: string;
    type: "success" | "error";
  }>({
    title: "",
    message: "",
    type: "success",
  });

  const handleRegister = async () => {
    if (loading) return;

    if (!fullName || !email || !password || !confirmPassword) {
      setNotificationData({
        title: "Thông tin không đầy đủ",
        message: "Vui lòng nhập đầy đủ thông tin",
        type: "error",
      });
      setShowNotification(true);
      return;
    }

    if (password !== confirmPassword) {
      setNotificationData({
        title: "Mật khẩu không khớp",
        message: "Mật khẩu xác nhận không khớp",
        type: "error",
      });
      setShowNotification(true);
      return;
    }

    try {
      setLoading(true);
      await register({ email, password, fullName });

      // Hiển thị notification thành công
      setNotificationData({
        title: "Đăng ký thành công!",
        message: `Chào mừng ${fullName}! Hãy đăng nhập để bắt đầu`,
        type: "success",
      });
      setShowNotification(true);

      // Delay 2 giây rồi redirect
      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 2000);
    } catch (e: any) {
      setNotificationData({
        title: "Đăng ký thất bại",
        message: e.message || "Đăng ký thất bại",
        type: "error",
      });
      setShowNotification(true);
    } finally {
      setLoading(false);
    }
  };

  // component
  const InputLabel = ({
    icon,
    label,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
  }) => (
    <View className="flex-row items-center mb-2 ml-1">
      <Ionicons name={icon} size={16} color="#6b7280" />
      <Text className="text-gray-700 font-medium ml-2 text-sm">{label}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <SafeAreaView edges={["top"]} className="bg-white">
        <View className="px-6 py-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          className="px-6"
        >
          {/*Title */}
          <View className="items-center mb-8 mt-2">
            <View className="w-20 h-20 bg-violet-100 rounded-full items-center justify-center mb-4 border-4 border-violet-50">
              <Ionicons name="person-add" size={32} color="#7c3aed" />
            </View>
            <Text className="text-3xl font-bold text-gray-900">
              Tạo tài khoản
            </Text>
            <Text className="text-gray-500 mt-2 text-center">
              Điền thông tin bên dưới để tham gia cùng chúng tôi
            </Text>
          </View>

          {/* Form  */}
          <View className="space-y-5">
            {/* Full Name */}
            <View>
              <InputLabel icon="person-outline" label="Họ và tên" />
              <Input
                placeholder="Ví dụ: Nguyễn Văn A"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Email */}
            <View>
              <InputLabel icon="mail-outline" label="Email" />
              <Input
                placeholder="name@example.com"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password */}
            <View>
              <InputLabel icon="lock-closed-outline" label="Mật khẩu" />
              <Input
                placeholder="Tạo mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Confirm Password */}
            <View>
              <InputLabel
                icon="shield-checkmark-outline"
                label="Xác nhận mật khẩu"
              />
              <Input
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
          </View>

          {/* Button Submit */}
          <View className="mt-8 mb-6">
            <Button
              title="Đăng ký ngay"
              onPress={handleRegister}
              loading={loading}
            />
          </View>

          {/* Footer*/}
          <View className="flex-row justify-center items-center pb-6">
            <Text className="text-gray-500">Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-violet-600 font-bold ml-1">Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Notification Modal */}
      <Modal
        visible={showNotification}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotification(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View
            className={`w-80 p-6 rounded-3xl shadow-2xl ${
              notificationData.type === "success"
                ? "bg-gradient-to-br from-green-50 to-emerald-50"
                : "bg-gradient-to-br from-red-50 to-orange-50"
            }`}
          >
            {/* Icon */}
            <View
              className={`w-16 h-16 rounded-full ${
                notificationData.type === "success"
                  ? "bg-green-100"
                  : "bg-red-100"
              } items-center justify-center mb-4 self-center`}
            >
              <Ionicons
                name={
                  notificationData.type === "success"
                    ? "checkmark-circle"
                    : "close-circle"
                }
                size={40}
                color={
                  notificationData.type === "success" ? "#10B981" : "#EF4444"
                }
              />
            </View>

            {/* Title */}
            <Text
              className={`text-xl font-bold text-center mb-2 ${
                notificationData.type === "success"
                  ? "text-green-900"
                  : "text-red-900"
              }`}
            >
              {notificationData.title}
            </Text>

            {/* Message */}
            <Text
              className={`text-center text-sm leading-6 ${
                notificationData.type === "success"
                  ? "text-green-700"
                  : "text-red-700"
              }`}
            >
              {notificationData.message}
            </Text>

            {/* Loading */}
            {notificationData.type === "success" && (
              <View className="mt-6 items-center">
                <View className="w-8 h-8 rounded-full border-4 border-green-300 border-t-green-600 animate-spin" />
                <Text className="text-xs text-green-600 mt-3 font-medium">
                  Đang chuyển hướng...
                </Text>
              </View>
            )}

            {notificationData.type === "error" && (
              <TouchableOpacity
                onPress={() => setShowNotification(false)}
                className="mt-6 bg-red-600 py-3 rounded-2xl"
              >
                <Text className="text-white font-bold text-center">Đóng</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
