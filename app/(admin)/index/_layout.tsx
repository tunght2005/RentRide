import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="contracts" />
      <Stack.Screen name="index" />
    </Stack>
  );
}
