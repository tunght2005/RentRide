import { View, Text, ActivityIndicator } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";
import { useUser } from "../hooks/useUser";

export default function StartScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUser(user);

  useEffect(() => {
    if (!authLoading && !profileLoading) {
      setTimeout(() => {
        if (!user) {
          router.replace("/(auth)/login");
        } else if (profile?.role === "admin") {
          router.replace("/(admin)");
        } else {
          router.replace("/(tabs)");
        }
      }, 1500);
    }
  }, [authLoading, profileLoading, user, profile]);

  return (
    <View className="flex-1 bg-white justify-center items-center">
      <StatusBar style="dark" />

      {/* Logo */}
      <View className="w-20 h-20 bg-blue-500 rounded-2xl justify-center items-center mb-6">
        <Ionicons name="car-sport" size={40} color="white" />
      </View>

      {/* App Name */}
      <Text className="text-3xl font-bold text-gray-900 mb-2">RentRide</Text>
      <Text className="text-gray-500 text-sm mb-8">Cho thuê xe thông minh</Text>

      {/* Loading */}
      <ActivityIndicator size="large" color="#3B82F6" />
    </View>
  );
}
