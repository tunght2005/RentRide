import { Stack, router } from "expo-router";
import { TouchableOpacity, Platform, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: "#7F56D9" },
        headerTintColor: "#ffffff",
        headerTitleStyle: { fontWeight: "bold", fontSize: 18 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />

      <Stack.Screen
        name="info"
        options={{
          title: "Hồ sơ cá nhân",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.6}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              style={{
                marginLeft: Platform.OS === "ios" ? -8 : 0,
                padding: 4,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="chevron-back" size={26} color="#ffffff" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: "Chỉnh sửa thông tin cá nhân",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.6}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              style={{
                marginLeft: Platform.OS === "ios" ? -8 : 0,
                padding: 4,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="chevron-back" size={26} color="#ffffff" />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
