import { Pressable, Text, ActivityIndicator } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function Button({ title, onPress, loading, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`h-12 rounded-xl items-center justify-center
        ${disabled ? "bg-gray-300" : "bg-pink-500"}`}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className="text-white font-semibold">{title}</Text>
      )}
    </Pressable>
  );
}
