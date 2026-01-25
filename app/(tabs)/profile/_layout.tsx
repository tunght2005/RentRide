import { Stack, router } from "expo-router";
import { TouchableOpacity, Platform, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
        // 1. MÀU NỀN TÍM (Thay mã màu của bạn vào đây nếu khác)
        headerStyle: { backgroundColor: "#7F56D9" },

        // 2. MÀU CHỮ TIÊU ĐỀ TRẮNG (Để nổi trên nền tím)
        headerTintColor: "#ffffff",

        headerTitleStyle: { fontWeight: "bold", fontSize: 18 },

        // Với header màu đậm, bỏ shadow (false) thường nhìn sẽ phẳng và hiện đại hơn
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
              // Giữ nguyên kỹ thuật mở rộng vùng bấm (Hit Slop)
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              style={{
                // Giữ nguyên kỹ thuật căn lề
                marginLeft: Platform.OS === "ios" ? -8 : 0,
                padding: 4,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* 3. ĐỔI MÀU ICON SANG TRẮNG */}
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
              // Giữ nguyên kỹ thuật mở rộng vùng bấm (Hit Slop)
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              style={{
                // Giữ nguyên kỹ thuật căn lề
                marginLeft: Platform.OS === "ios" ? -8 : 0,
                padding: 4,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* 3. ĐỔI MÀU ICON SANG TRẮNG */}
              <Ionicons name="chevron-back" size={26} color="#ffffff" />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
