import { getVehicleById } from "@/lib/firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function VehicleDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const TYPE_CONFIG: Record<
    string,
    { label: string; bg: string; text: string }
  > = {
    "ô tô": {
      label: "🚗 ô tô",
      bg: "bg-pink-100",
      text: "text-pink-600",
    },
    "xe máy": {
      label: "🏍 xe máy",
      bg: "bg-blue-100",
      text: "text-blue-600",
    },
    "xe đạp": {
      label: "🚲 xe đạp",
      bg: "bg-green-100",
      text: "text-green-600",
    },
  };

  useEffect(() => {
    if (!id) return;
    getVehicleById(id).then((data) => {
      setVehicle(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  if (!vehicle) {
    return <Text>Không tìm thấy xe</Text>;
  }

  // 🔥 CHUẨN HOÁ TYPE: string | array → array
  const vehicleTypes: string[] = Array.isArray(vehicle.type)
    ? vehicle.type
    : typeof vehicle.type === "string"
      ? [vehicle.type]
      : [];

  return (
    <ScrollView className="flex-1 bg-white">
      {/* HEADER */}
      <View className="flex-row items-center px-4 pt-12 pb-3 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>

        <Text className="text-lg font-bold ml-2 flex-1" numberOfLines={1}>
          {vehicle.name}
        </Text>
      </View>

      {/* IMAGE */}
      <Image
        source={{
          uri: vehicle.images?.[0] ?? "https://via.placeholder.com/400",
        }}
        className="w-full h-60 bg-gray-100"
        resizeMode="contain"
      />

      {/* CONTENT */}
      <View className="p-4">
        {/* TYPE TAG */}
        <View className="flex-row gap-2 flex-wrap">
          {vehicleTypes.map((type) => {
            const key = type.toLowerCase();
            const config = TYPE_CONFIG[key];
            if (!config) return null;

            return (
              <Text
                key={type}
                className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold`}
              >
                {config.label}
              </Text>
            );
          })}
        </View>

        {/* RATING */}
        <View className="flex-row items-center mt-3">
          <Text className="text-yellow-500 mr-1">⭐</Text>
          <Text className="font-semibold">{vehicle.ratingAvg ?? 0}</Text>
        </View>

        {/* PRICE */}
        <Text className="text-pink-600 text-xl font-bold mt-4">
          {vehicle.pricePerDay?.toLocaleString()} đ
          <Text className="text-gray-500 font-normal"> / ngày</Text>
        </Text>

        {/* DESCRIPTION */}
        <Text className="text-gray-700 mt-4 leading-6">
          {vehicle.description}
        </Text>

        {/* ACTION */}
        <TouchableOpacity className="bg-violet-600 py-4 rounded-2xl mt-6">
          <Text className="text-white text-center font-bold text-base">
            Đặt xe ngay
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
