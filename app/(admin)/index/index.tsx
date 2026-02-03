import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  listenTotalVehicles,
  listenTotalRevenue,
  listenLatestContracts,
} from "../../../lib/firebase/firestore";

export default function DashboardScreen() {
  const router = useRouter();
  const [totalVehicles, setTotalVehicles] = useState<number | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [contracts, setContracts] = useState<any[]>([]);

  // tổng số xe
  useEffect(() => {
    const unsubscribe = listenTotalVehicles(setTotalVehicles);
    return unsubscribe;
  }, []);

  // tổng doanh thu
  useEffect(() => {
    const unsubscribe = listenTotalRevenue(setTotalRevenue);
    return unsubscribe;
  }, []);

  // hợp đồng
  useEffect(() => {
    const unsubscribe = listenLatestContracts((data) => {
      setContracts(data);
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
        </View>

        {/* Doanh thu */}
        <View className="bg-white rounded-2xl p-4 mt-4 flex-row items-center">
          <View className="bg-green-100 p-3 rounded-full">
            <Ionicons name="cash-outline" size={24} color="#22c55e" />
          </View>
          <View className="ml-4">
            <Text className="text-gray-500">Doanh thu</Text>
            <Text className="text-2xl font-bold text-green-500">
              {totalRevenue.toLocaleString()} đ
            </Text>
          </View>
        </View>

        {/* Xe gần đây */}
        <Text className="text-lg font-semibold mt-6 mb-2">
          Hợp đồng mới gần đây
        </Text>

        {contracts.length === 0 && (
          <Text className="text-gray-400 text-center mt-4">Chưa có xe nào</Text>
        )}

        {contracts.map((item) => (
          <OrderItem
            key={item.id}
            title={item.vehicle?.name || "N/A"}
            user={item.vehicle?.brand || "N/A"}
            image={item.vehicle?.image}
            price={item.booking?.totalPrice?.toLocaleString() + " đ" || "0 đ"}
            status={
              item.status === "paid"
                ? "Đang thuê"
                : item.status === "pending"
                  ? "Chưa thanh toán"
                  : "Huỷ"
            }
            statusStyle={
              item.status === "paid"
                ? "bg-green-100 text-green-600"
                : item.status === "pending"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-gray-100 text-gray-600"
            }
            onPress={() =>
              router.push({
                pathname: "[id]",
                params: { id: item.id },
              })
            }
          />
        ))}

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}

/* COMPONENT */

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
          uri: image || "https://via.placeholder.com/150",
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
