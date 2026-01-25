import React from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../../../hooks/useAuth";
import { useUser } from "../../../hooks/useUser";
import { Button } from "../../../components/common/Button";

export default function ProfileScreen() {
  const { user, loading: authLoading, logout } = useAuth();
  const { profile, loading: profileLoading } = useUser(user);

  // ⏳ Loading (chỉ để hiển thị UI)
  if (authLoading || profileLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  // 🔒 Không có user → index.tsx sẽ redirect
  if (!user) return null;

  const fullName =
    profile?.fullName?.trim() ||
    user.displayName ||
    user.email?.split("@")[0] ||
    "Người dùng";

  const isAdmin = profile?.role === "admin";

  // ✅ LOGOUT CHUẨN – KHÔNG CHỜ useEffect
  // const handleLogout = () => {
  //   Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
  //     { text: "Hủy", style: "cancel" },
  //     {
  //       text: "Đăng xuất",
  //       style: "destructive",
  //       onPress: async () => {
  //         await logout();
  //         router.replace("/(auth)/login");
  //       },
  //     },
  //   ]);
  // };

  const MENU_ITEMS = [
    {
      label: "Thông tin cá nhân",
      route: "(admin)/profile/info",
      icon: "person-outline",
      color: "#3b82f6",
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header background */}
      <View className="absolute top-0 left-0 right-0 h-48 bg-violet-600 rounded-b-[40px]" />

      <SafeAreaView className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Header title */}
          <View className="px-6 pt-2 pb-6">
            <Text className="text-2xl font-bold text-white">Hồ sơ cá nhân</Text>
          </View>

          {/* User Card */}
          <View className="mx-5 p-5 bg-white rounded-3xl flex-row items-center shadow-sm shadow-black/10">
            <Image
              source={{
                uri: profile?.avatar
                  ? profile.avatar
                  : `https://ui-avatars.com/api/?name=${fullName}&background=random`,
              }}
              className="w-16 h-16 rounded-full border-2 border-white"
            />

            <View className="flex-1 ml-4">
              <Text
                className="text-lg font-bold text-gray-800"
                numberOfLines={1}
              >
                {fullName}
              </Text>

              <Text className="text-gray-500 text-sm" numberOfLines={1}>
                {profile?.email || user.email}
              </Text>

              <View
                className={`self-start mt-2 px-3 py-1 rounded-full ${
                  isAdmin ? "bg-violet-100" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isAdmin ? "text-violet-600" : "text-gray-600"
                  }`}
                >
                  {isAdmin ? "Admin Access" : "Thành viên"}
                </Text>
              </View>
            </View>
          </View>

          {/* Menu */}
          <View className="mx-5 mt-6 bg-white rounded-3xl overflow-hidden shadow-sm shadow-black/5">
            {MENU_ITEMS.map((item, index) => (
              <Pressable
                key={item.label}
                onPress={() => router.push(item.route as any)}
                className={`flex-row items-center px-5 py-4 ${
                  index !== MENU_ITEMS.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={item.color}
                  />
                </View>

                <Text className="flex-1 text-base text-gray-700 font-medium">
                  {item.label}
                </Text>

                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </Pressable>
            ))}
          </View>

          {/* Logout */}
          {/* Logout */}
          <Pressable
            onPress={async () => {
              // ✅ Giữ nguyên logic của bạn
              await logout();
              router.replace("/(auth)/login");
            }}
            // Style mới: Nền trắng, khi bấm hơi mờ đi, có đổ bóng nhẹ
            className="bg-white p-1 rounded-3xl shadow-sm shadow-gray-200 active:opacity-60 m-10 my-30"
          >
            {/* Bên trong là khung màu đỏ nhạt để cảnh báo đây là nút thoát */}
            <View className="flex-row items-center justify-center py-4 bg-red-50 rounded-[20px] border border-red-100">
              <Ionicons name="log-out-outline" size={22} color="#ef4444" />
              <Text className="text-red-500 font-bold text-base ml-2">
                Đăng xuất
              </Text>
            </View>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
