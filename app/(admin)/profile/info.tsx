import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useUser } from "../../../hooks/useUser";
import { useAuth } from "../../../hooks/useAuth";

// Component con để hiển thị từng dòng thông tin (giúp code gọn hơn)
const InfoItem = ({
  icon,
  label,
  value,
  isLast = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | null | undefined;
  isLast?: boolean;
}) => {
  if (!value) return null; // Nếu không có dữ liệu thì ẩn luôn dòng đó

  return (
    <View
      className={`flex-row items-center py-4 ${!isLast ? "border-b border-gray-100" : ""}`}
    >
      {/* Icon Box */}
      <View className="w-10 h-10 rounded-full bg-violet-50 items-center justify-center mr-4">
        <Ionicons name={icon} size={20} color="#8b5cf6" />
      </View>

      {/* Text Content */}
      <View className="flex-1">
        <Text className="text-xs text-gray-400 font-medium uppercase mb-0.5 tracking-wider">
          {label}
        </Text>
        <Text className="text-base text-gray-800 font-semibold">{value}</Text>
      </View>
    </View>
  );
};

export default function ProfileInfoScreen() {
  const { user } = useAuth();
  const { profile, loading } = useUser(user);

  // 1. Loading State đẹp hơn
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text className="text-gray-400 text-xs mt-2">Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (!profile) return null;

  return (
    <>
      <ScrollView
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pb-10">
          {/* --- PHẦN 1: AVATAR --- */}
          <View className="items-center py-8">
            <View className="relative">
              <Image
                source={{
                  uri: profile?.avatar
                    ? profile.avatar
                    : `https://ui-avatars.com/api/?name=${profile.fullName}&background=8b5cf6&color=fff&size=256`,
                }}
                className="w-28 h-28 rounded-full border-4 border-gray-50"
              />
              {/* Nút nhỏ giả lập edit avatar */}
              <View className="absolute bottom-0 right-0 bg-gray-900 p-2 rounded-full border-2 border-white">
                <Ionicons name="camera" size={16} color="white" />
              </View>
            </View>

            <Text className="text-xl font-bold text-gray-900 mt-4">
              {profile.fullName}
            </Text>
            <View className="flex-row items-center mt-1 bg-violet-100 px-3 py-1 rounded-full">
              <Ionicons
                name="shield-checkmark"
                size={12}
                color="#7c3aed"
                style={{ marginRight: 4 }}
              />
              <Text className="text-violet-700 text-xs font-bold uppercase">
                {profile.role === "admin" ? "Quản trị viên" : "Thành viên"}
              </Text>
            </View>
          </View>

          {/* --- PHẦN 2: FORM THÔNG TIN --- */}
          <View className="bg-white">
            <Text className="text-lg font-bold text-gray-900 mb-2">
              Chi tiết
            </Text>

            {/* Khung chứa thông tin */}
            <View className="bg-gray-50 rounded-2xl px-4 border border-gray-100">
              <InfoItem
                icon="person-outline"
                label="Họ và tên"
                value={profile.fullName}
              />
              <InfoItem
                icon="mail-outline"
                label="Email đăng nhập"
                value={profile.email}
              />
              <InfoItem
                icon="call-outline"
                label="Số điện thoại"
                value={profile.phone || "Chưa cập nhật"}
                isLast={true}
              />
            </View>
          </View>

          {/* --- PHẦN 3: ACTION BUTTON --- */}
          <View className="mt-8">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/(admin)/profile/edit")}
              className="bg-violet-600 rounded-xl py-4 flex-row justify-center items-center shadow-lg shadow-violet-200"
            >
              <Ionicons
                name="create-outline"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text className="text-white font-bold text-base">
                Cập nhật thông tin
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
