import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../hooks/useAuth";
import { useUser } from "../hooks/useUser";

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUser(user);

  if (authLoading || profileLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)/login" />;

  if (profile?.role === "admin") {
    return <Redirect href="/(admin)" />;
  }

  return <Redirect href="/(tabs)" />;
}
