import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="info" />
      <Stack.Screen name="index" />
    </Stack>
  );
}