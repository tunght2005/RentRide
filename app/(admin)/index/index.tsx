import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  listenTotalVehicles,
  listenLatestVehicles,
} from "../../../lib/firebase/firestore";

export default function DashboardScreen() {
  const router = useRouter();
  const [totalVehicles, setTotalVehicles] = useState<number | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);

  // 🔥 realtime tổng số xe
  useEffect(() => {
    const unsubscribe = listenTotalVehicles(setTotalVehicles);
    return unsubscribe;
  }, []);

  // 🔥 realtime 5 xe mới nhất
  useEffect(() => {
    const unsubscribe = listenLatestVehicles((data) => {
      setVehicles(data);
    });
    return unsubscribe;
  }, []);

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4 pt-4">
        {/* Thống kê */}
        <View className="flex-row gap-4">
          <StatBox
            icon="car-outline"
            bg="bg-pink-100"
            iconColor="#ec4899"
            title="Tổng số xe"
            value={totalVehicles === null ? "..." : totalVehicles}
          />

          <StatBox
            icon="calendar-outline"
            bg="bg-blue-100"
            iconColor="#3b82f6"
            title="Xe đang hiển thị"
            value={vehicles.length}
          />
        </View>

        {/* Doanh thu */}
        <View className="bg-white rounded-2xl p-4 mt-4 flex-row items-center">
          <View className="bg-green-100 p-3 rounded-full">
            <Ionicons name="cash-outline" size={24} color="#22c55e" />
          </View>
          <View className="ml-4">
            <Text className="text-gray-500">Doanh thu</Text>
            <Text className="text-2xl font-bold text-green-500">
              20.700.000 đ
            </Text>
          </View>
        </View>

        {/* Xe gần đây */}
        <Text className="text-lg font-semibold mt-6 mb-2">
          Xe mới thêm gần đây
        </Text>

        {vehicles.length === 0 && (
          <Text className="text-gray-400 text-center mt-4">
            Chưa có xe nào
          </Text>
        )}

        {vehicles.map((item) => (
          <OrderItem
            key={item.id}
            title={item.name}
            user={item.brand}
            image={item.images?.[0] || item.image}
            price={item.price?.toLocaleString() + " đ"}
            status={
              item.status === "renting"
                ? "Đang thuê"
                : item.status === "maintenance"
                ? "Bảo trì"
                : "Sẵn sàng"
            }
            statusStyle={
              item.status === "renting"
                ? "bg-red-100 text-red-600"
                : item.status === "maintenance"
                ? "bg-yellow-100 text-yellow-600"
                : "bg-green-100 text-green-600"
            }
            onPress={() =>
              router.push(`../admin/vehicles/${item.id}`)
            }
          />
        ))}

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}

/* ================= COMPONENT ================= */

function StatBox({ icon, bg, iconColor, title, value }: any) {
  return (
    <View className="flex-1 bg-white rounded-2xl p-4 flex-row items-center">
      <View className={`${bg} p-3 rounded-full`}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View className="ml-3">
        <Text className="text-gray-500">{title}</Text>
        <Text className="text-xl font-bold">{value}</Text>
      </View>
    </View>
  );
}

function OrderItem({
  title,
  user,
  price,
  status,
  statusStyle,
  onPress,
  image,
}: any) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="bg-white rounded-2xl p-3 mb-3 flex-row items-center"
    >
      <Image
        source={{
          uri:
            image ||
            "https://via.placeholder.com/150",
        }}
        className="w-14 h-14 rounded-xl"
        resizeMode="cover"
      />

      <View className="flex-1 ml-3">
        <Text className="font-semibold">{title}</Text>
        <Text className="text-gray-500 text-sm">{user}</Text>
      </View>

      <View className="items-end">
        <View className={`px-3 py-1 rounded-full ${statusStyle}`}>
          <Text className="text-xs font-semibold">{status}</Text>
        </View>
        <Text className="text-gray-600 mt-1">{price}</Text>
      </View>
    </TouchableOpacity>
  );
}
