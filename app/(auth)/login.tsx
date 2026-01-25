import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // Import Icon

import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useAuth } from "../../hooks/useAuth";

export default function LoginScreen() {
  const { loginWithGoogle, loginAdmin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ LOGIC GIỮ NGUYÊN 100%
  const handleAdminLogin = async () => {
    try {
      setLoading(true);
      await loginAdmin(email, password);
      router.replace("/");
    } catch (e: any) {
      Alert.alert("Lỗi", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // KeyboardAvoidingView: Kỹ thuật frontend giúp input không bị bàn phím che
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        showsVerticalScrollIndicator={false}
        className="px-6"
      >
        {/* --- 1. HEADER & LOGO --- */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-violet-100 rounded-3xl justify-center items-center mb-4 rotate-3">
            <Ionicons name="cube" size={40} color="#7c3aed" />
          </View>
          <Text className="text-3xl font-bold text-gray-900">Chào mừng!</Text>
          <Text className="text-gray-500 mt-2 text-center">
            Đăng nhập để quản lý hệ thống của bạn
          </Text>
        </View>

        {/* --- 2. GOOGLE LOGIN (Custom Button đẹp hơn) --- */}
        <TouchableOpacity
          onPress={loginWithGoogle}
          activeOpacity={0.8}
          className="flex-row items-center justify-center bg-white border border-gray-200 py-3.5 rounded-2xl shadow-sm mb-6"
        >
          <Ionicons name="logo-google" size={20} color="#DB4437" />
          <Text className="font-semibold text-gray-700 ml-3">
            Tiếp tục với Google
          </Text>
        </TouchableOpacity>

        {/* --- 3. DIVIDER (Đường kẻ phân cách) --- */}
        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-[1px] bg-gray-200" />
          <Text className="mx-4 text-gray-400 text-xs font-medium uppercase tracking-wider">
            Hoặc đăng nhập bằng Email
          </Text>
          <View className="flex-1 h-[1px] bg-gray-200" />
        </View>

        {/* --- 4. FORM INPUT --- */}
        <View className="space-y-4">
          <View>
            <Text className="text-gray-700 font-medium mb-1.5 ml-1">Email</Text>
            <Input
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              // Nếu component Input của bạn hỗ trợ style container, hãy thêm icon mail ở đây
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

          {/* Quên mật khẩu nằm ngay dưới Input Pass cho tiện tay bấm */}
          <TouchableOpacity
            onPress={() => router.push("/(auth)/forgot-password")}
            className="self-end"
          >
            <Text className="text-violet-600 font-semibold text-sm">
              Quên mật khẩu?
            </Text>
          </TouchableOpacity>
        </View>

        {/* --- 5. BUTTON LOGIN CHÍNH --- */}
        <View className="mt-6 mb-8">
          <Button
            title="Đăng nhập"
            onPress={handleAdminLogin}
            loading={loading}
            // Style cho Button (Nếu component Button hỗ trợ className/style)
            // Thường nút chính nên to và đậm
          />
        </View>

        {/* --- 6. FOOTER REGISTER --- */}
        <View className="flex-row justify-center items-center">
          <Text className="text-gray-500">Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text className="text-violet-600 font-bold ml-1">Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
