import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { getVehicleById } from "../../../lib/firebase/firestore";

const Item = ({ label, value }: any) => (
  <View className="flex-row justify-between py-3 border-b border-gray-100">
    <Text className="text-gray-500">{label}</Text>
    <Text className="font-medium max-w-[60%] text-right">
      {value ?? "-"}
    </Text>
  </View>
);

export default function VehicleInfoScreen() {
  const { id } = useLocalSearchParams();
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    getVehicleById(id as string).then((data) => {
      setVehicle(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Không tìm thấy xe</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="p-4 border-b border-gray-100">
        <Pressable onPress={() => router.back()}>
          <Text className="text-blue-600 mb-2">← Quay lại</Text>
        </Pressable>

        <Text className="text-xl font-bold">{vehicle.name}</Text>
        <Text className="text-gray-500">{vehicle.brand}</Text>
      </View>

      {/* Ảnh xe */}
      {vehicle.images?.[0] && (
        <Image
          source={{ uri: vehicle.images[0] }}
          className="w-full h-52"
          resizeMode="cover"
        />
      )}

      {/* Thông tin xe */}
      <View className="p-4">
        <Text className="font-bold text-lg mb-2">🚗 Thông tin xe</Text>

        <Item label="Tên xe" value={vehicle.name} />
        <Item label="Thương hiệu" value={vehicle.brand} />
        <Item label="Loại xe" value={vehicle.type} />
        <Item label="Hộp số" value={vehicle.transmission} />
        <Item
          label="Giá / ngày"
          value={vehicle.price?.toLocaleString() + " đ"}
        />
        <Item label="Trạng thái" value={vehicle.status} />
        <Item label="Mô tả" value={vehicle.description} />
      </View>

      <View className="h-10" />
    </ScrollView>
  );
}
