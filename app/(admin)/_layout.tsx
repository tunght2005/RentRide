import { Tabs } from "expo-router";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CONFIG = {
  primary: "#8b5cf6",
  inactive: "#71717a",
  barBg: "#18181b",
};

// Nút Giữa
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

//Tab Thường
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

        // Navbar
        tabBarStyle: {
          position: "absolute",
          bottom: 25,
          left: 20,
          right: 20,
          height: 70,
          borderRadius: 40,
          backgroundColor: CONFIG.barBg,
          borderTopWidth: 0,
          paddingBottom: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
          elevation: 5,
        },
        tabBarItemStyle: {
          height: 70,
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
        name="manager"
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
