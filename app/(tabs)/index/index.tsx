import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useVehicles } from "../../../hooks/useVehicles";
import { getAllVehicles } from "../../../lib/firebase/firestore";

export default function HomeScreen() {
  const router = useRouter();
  const [openCategory, setOpenCategory] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const { id } = useLocalSearchParams<{ id: string }>();
  // 🔹 load data từ Firestore
  useEffect(() => {
    getAllVehicles().then(setVehicles);
  }, []);
  useEffect(() => {
    // Chỉ chạy trên web (VNPAY redirect)
    if (Platform.OS === "web") {
      const success = localStorage.getItem("payment_success");

      if (success === "true") {
        Alert.alert(
          "Thanh toán thành công 🎉",
          "Cảm ơn bạn đã sử dụng dịch vụ RentRide",
        );

        localStorage.removeItem("payment_success");
      }
    }
  }, []);

  // 🔹 logic tách sang hook
  const {
    searchText,
    setSearchText,
    selectedType,
    setSelectedType,
    selectedLocation,
    setSelectedLocation,
    maxPrice,
    setMaxPrice,
    filteredVehicles,
  } = useVehicles(vehicles);

  const featuredVehicles = vehicles.slice(0, 3);

  return (
    <ScrollView className="flex-1 bg-white px-4 pt-4">
      {/* HEADER */}
      <Text className="text-xl font-bold">RentRide</Text>

      {/* SEARCH */}
      <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3 mt-4">
        <Ionicons name="search-outline" size={20} color="#9CA3AF" />
        <TextInput
          placeholder="Tìm kiếm xe..."
          placeholderTextColor="#9CA3AF"
          value={searchText}
          onChangeText={setSearchText}
          className="flex-1 ml-3 text-base text-gray-800"
        />
      </View>

      {/* CATEGORY */}
      <View className="mt-4">
        <TouchableOpacity
          className="flex-row items-center justify-between"
          onPress={() => setOpenCategory(!openCategory)}
        >
          <Text className="font-bold text-base">Danh mục</Text>
          <Ionicons
            name={openCategory ? "chevron-up" : "chevron-down"}
            size={20}
            color="#374151"
          />
        </TouchableOpacity>

        {openCategory && (
          <View className="mt-3 bg-gray-50 rounded-xl p-4 space-y-4">
            {/* LOẠI XE */}
            <View>
              <Text className="font-semibold mb-2">Loại xe</Text>

              {[
                { label: "🚗 Ô tô", value: "ô tô" },
                { label: "🏍 Xe máy", value: "xe máy" },
                { label: "🚲 Xe đạp", value: "xe đạp" },
              ].map((item) => (
                <TouchableOpacity
                  key={item.value}
                  className="py-2 border-b border-gray-200"
                  onPress={() =>
                    setSelectedType(
                      selectedType === item.value ? null : item.value,
                    )
                  }
                >
                  <Text className="text-gray-700">{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* LOCATION */}
            <View>
              <Text className="font-semibold mb-2">Khu vực</Text>

              {[
                { label: "📍 TP.HCM", value: "HCM" },
                { label: "📍 Hà Nội", value: "HN" },
              ].map((item) => (
                <TouchableOpacity
                  key={item.value}
                  className="py-2 border-b border-gray-200"
                  onPress={() =>
                    setSelectedLocation(
                      selectedLocation === item.value ? null : item.value,
                    )
                  }
                >
                  <Text
                    className={
                      selectedLocation === item.value
                        ? "text-pink-600 font-semibold"
                        : "text-gray-700"
                    }
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* GIÁ */}
            <View>
              <Text className="font-semibold mb-2">Giá (₫)</Text>
              <Text className="text-gray-500 mb-3">
                0 – {maxPrice.toLocaleString()} đ
              </Text>

              <Slider
                minimumValue={0}
                maximumValue={3000000}
                step={50000}
                value={maxPrice}
                onValueChange={setMaxPrice}
                minimumTrackTintColor="#e11d48"
                maximumTrackTintColor="#e5e7eb"
                thumbTintColor="#e11d48"
              />

              <View className="flex-row justify-between mt-1">
                <Text className="text-xs text-gray-400">0</Text>
                <Text className="text-xs text-gray-400">3.000.000</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* XE NỔI BẬT */}
      <Text className="text-lg font-bold mt-6 mb-3">Xe nổi bật ⭐</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {featuredVehicles.map((v) => (
          <TouchableOpacity
            key={v.id}
            className="w-[85%] h-48 bg-white rounded-3xl mr-5 mb-4 overflow-hidden border border-gray-200 shadow-md"
            onPress={() =>
              router.push({
                pathname: "/vehicle/[id]",
                params: { id: v.id },
              })
            }
          >
            <Image
              source={{
                uri:
                  v.images && v.images.length > 0
                    ? v.images[0]
                    : "https://via.placeholder.com/300",
              }}
              className="w-full h-full"
              resizeMode="contain"
            />
            <View className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full flex-row items-center">
              <Text className="text-yellow-500 mr-1">⭐</Text>
              <Text className="text-sm font-semibold">{v.ratingAvg}</Text>
            </View>

            <View className="p-3">
              <Text className="font-bold">{v.name}</Text>
              <Text className="text-gray-500 text-sm">
                {(v.price ?? 0).toLocaleString()} đ / ngày
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* TẤT CẢ XE */}
      <Text className="text-lg font-bold mt-8 mb-4">Tất cả xe</Text>

      <View className="flex-row flex-wrap justify-between">
        {filteredVehicles.map((v) => (
          <TouchableOpacity
            key={v.id}
            onPress={() =>
              router.push({
                pathname: "/vehicle/[id]",
                params: { id: v.id },
              })
            }
            className="w-[48%]
              h-48 bg-white rounded-2xl mb-6 overflow-hidden border border-gray-200 shadow-sm"
          >
            <Image
              source={{
                uri:
                  v.images && v.images.length > 0
                    ? v.images[0]
                    : "https://via.placeholder.com/300",
              }}
              className="w-full h-full"
              resizeMode="contain"
            />

            <View className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full flex-row items-center">
              <Text className="text-yellow-500 mr-1">⭐</Text>
              <Text className="text-xs font-semibold">{v.ratingAvg}</Text>
            </View>

            <View className="absolute top-2 left-2 bg-pink-600 px-2 py-1 rounded-full">
              <Text className="text-white text-xs">{v.type?.[0]}</Text>
            </View>

            <View className="p-3">
              <Text className="font-bold text-sm">{v.name}</Text>
              <Text className="text-pink-600 font-bold mt-2">
                {Number(v.price ?? 0).toLocaleString()} đ
                <Text className="text-gray-500 font-normal"> /ngày</Text>
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View className="h-6" />
    </ScrollView>
  );
}
