import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";

import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useAuth } from "../../hooks/useAuth";
import { db } from "../../lib/firebase/firestore";

export default function LoginScreen() {
  const { loginWithGoogle, loginAdmin, googleLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState<{
    title: string;
    message: string;
    type: "success" | "error";
    userName?: string;
  }>({
    title: "",
    message: "",
    type: "success",
  });

  // ktra role và redirect
  const handleAdminLogin = async () => {
    try {
      setLoading(true);
      const userCredential = await loginAdmin(email, password);
      const userId = userCredential.user.uid;
      const userDoc = await getDoc(doc(db, "users", userId));
      const userData = userDoc.data();
      setNotificationData({
        title: "Đăng nhập thành công!",
        message: `Chào mừng ${userData?.fullName || "bạn"} quay trở lại!`,
        type: "success",
        userName: userData?.fullName,
      });
      setShowNotification(true);

      // Delay 2 giây rồi redirect
      setTimeout(() => {
        if (userData?.role === "admin") {
          router.replace("/(admin)");
        } else {
          router.replace("/(tabs)");
        }
      }, 2000);
    } catch (e: any) {
      // Hiển thị lỗi
      setNotificationData({
        title: "Đăng nhập thất bại",
        message: e.message || "Email hoặc mật khẩu không chính xác",
        type: "error",
      });
      setShowNotification(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        showsVerticalScrollIndicator={false}
        className="px-6"
      >
        {/* LOGO */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-violet-100 rounded-3xl justify-center items-center mb-4 rotate-3">
            <Ionicons name="cube" size={40} color="#7c3aed" />
          </View>
          <Text className="text-3xl font-bold text-gray-900">Chào mừng!</Text>
          <Text className="text-gray-500 mt-2 text-center">
            Đăng nhập để quản lý hệ thống của bạn
          </Text>
        </View>

        {/*GOOGLE LOGIN */}
        <TouchableOpacity
          onPress={loginWithGoogle}
          disabled={googleLoading}
          activeOpacity={0.8}
          className={`flex-row items-center justify-center border border-gray-200 py-3.5 rounded-2xl shadow-sm mb-6 ${
            googleLoading ? "bg-gray-100" : "bg-white"
          }`}
        >
          {googleLoading ? (
            <>
              <Text className="font-semibold text-gray-700">
                Đang kết nối...
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text className="font-semibold text-gray-700 ml-3">
                Tiếp tục với Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-[1px] bg-gray-200" />
          <Text className="mx-4 text-gray-400 text-xs font-medium uppercase tracking-wider">
            Hoặc đăng nhập bằng Email
          </Text>
          <View className="flex-1 h-[1px] bg-gray-200" />
        </View>

        {/* FORM INPUT*/}
        <View className="space-y-4">
          <View>
            <Text className="text-gray-700 font-medium mb-1.5 ml-1">Email</Text>
            <Input
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View className="mb-2">
            <Text className="text-gray-700 font-medium mb-1.5 ml-1">
              Mật khẩu
            </Text>
            <Input
              placeholder="Nhập mật khẩu của bạn"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(auth)/forgot-password")}
            className="self-end"
          >
            <Text className="text-violet-600 font-semibold text-sm">
              Quên mật khẩu?
            </Text>
          </TouchableOpacity>
        </View>

        {/*BUTTON LOGIN */}
        <View className="mt-6 mb-8">
          <Button
            title="Đăng nhập"
            onPress={handleAdminLogin}
            loading={loading}
          />
        </View>

        {/* REGISTER */}
        <View className="flex-row justify-center items-center">
          <Text className="text-gray-500">Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text className="text-violet-600 font-bold ml-1">Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
                <Text className="text-white font-bold text-center">
                  Thử lại
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
