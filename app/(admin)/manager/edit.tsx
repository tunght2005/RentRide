import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function Edit() {
  const { id } = useLocalSearchParams();

  return (
    <View style={{ flex:1, justifyContent:"center", alignItems:"center" }}>
      <Text>Sửa xe ID: {id}</Text>
    </View>
  );
}
