import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      {/* Tab screen */}
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Quản lý xe",
          headerShown: true 
        }} 
      />

      {/* Full screen pages (ẩn TabBar) */}
      <Stack.Screen 
        name="add" 
        options={{ 
          title: "Thêm xe",
          presentation: "modal",
          headerShown: true 
        }} 
      />

      <Stack.Screen 
        name="edit" 
        options={{ 
          title: "Chỉnh sửa xe",
          presentation: "modal",
          headerShown: true 
        }} 
      />

      <Stack.Screen 
        name="info" 
        options={{ 
          title: "Chi tiết xe",
          presentation: "modal",
          headerShown: true 
        }} 
      />
    </Stack>
  );
}
