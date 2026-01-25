import { View, Text, TextInput } from "react-native";

type Props = {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
};

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
}: Props) {
  return (
    <View className="mb-4">
      {label && <Text className="text-sm text-gray-500 mb-1">{label}</Text>}

      <TextInput
        className="border border-gray-200 rounded-xl px-4 py-3 text-base bg-white"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}
