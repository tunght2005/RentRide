import { Tabs } from "expo-router";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// --- CẤU HÌNH ---
const CONFIG = {
  primary: "#8b5cf6", // Violet-500
  inactive: "#71717a", // Zinc-500
  barBg: "#18181b", // Zinc-900
};

// 1. Nút Giữa (Giữ nguyên vì đã đẹp)
const FloatingBookingButton = ({ onPress }: { onPress?: (e: any) => void }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="top-[-30px] justify-center items-center z-50"
    >
      <View className="w-[72px] h-[72px] rounded-full bg-violet-500/20 items-center justify-center absolute" />
      <View
        className="w-16 h-16 rounded-full bg-violet-600 items-center justify-center border-4 border-[#18181b]"
        style={{
          shadowColor: "#8b5cf6",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.5,
          shadowRadius: 8,
          elevation: 10,
        }}
      >
        <Ionicons name="calendar" size={28} color="white" />
      </View>
    </TouchableOpacity>
  );
};

// 2. Tab Thường (ĐÃ SỬA: Căn chỉnh lại vị trí)
const StandardTabIcon = ({
  focused,
  iconName,
  label,
}: {
  focused: boolean;
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
}) => {
  return (
    // FIX: Thêm top-[12px] để đẩy icon + text xuống giữa thanh bar 70px
    // Bỏ mt-2 cũ đi để tránh bị đẩy lung tung
    <View className="items-center justify-center gap-1 top-[12px]">
      <Ionicons
        name={iconName}
        size={24}
        color={focused ? CONFIG.primary : CONFIG.inactive}
      />
      <Text
        className={`text-[10px] w-20 mx-auto text-center font-medium ${focused ? "text-violet-400" : "text-zinc-500"}`}
      >
        {label}
      </Text>
    </View>
  );
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,

        // --- STYLE THANH BAR ---
        tabBarStyle: {
          position: "absolute",
          bottom: 25,
          left: 20,
          right: 20,
          height: 70,
          borderRadius: 40,
          backgroundColor: CONFIG.barBg,
          borderTopWidth: 0,
          paddingBottom: 0, // Quan trọng: Reset padding đáy để dễ tính toán

          // Shadow
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
          elevation: 5,
        },
        // FIX: Đảm bảo item chiếm full chiều cao để không bị lệch click
        tabBarItemStyle: {
          height: 70,
          // Trên iOS đôi khi cần padding top để override safe area
          paddingTop: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <StandardTabIcon
              focused={focused}
              iconName={focused ? "home" : "home-outline"}
              label="Trang chủ"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="bookings"
        options={{
          tabBarButton: (props) => <FloatingBookingButton {...props} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <StandardTabIcon
              focused={focused}
              iconName={focused ? "person" : "person-outline"}
              label="Cá nhân"
            />
          ),
        }}
      />
    </Tabs>
  );
}
