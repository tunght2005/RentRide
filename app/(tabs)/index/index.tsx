import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
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

  // 🔹 logic filter từ hook
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

  // 🔹 xác định đang lọc hay không
  const isFiltering =
    selectedType !== null ||
    selectedLocation !== null ||
    maxPrice < 30000000;


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

        {/* NÚT XÓA BỘ LỌC */}
        {isFiltering && (
  <TouchableOpacity
    onPress={() => {
      setSelectedType(null);
      setSelectedLocation(null);
      setMaxPrice(30000000);
    }}
    className="mt-2 self-start bg-gray-200 px-3 py-1 rounded-full"
  >
    <Text className="text-sm text-gray-700 font-semibold">
       Xóa bộ lọc
    </Text>
  </TouchableOpacity>
)}


        {/* THÔNG TIN ĐANG LỌC */}
        {/* THÔNG TIN ĐANG LỌC */}
{isFiltering && (
  <View className="mt-3 flex-row flex-wrap gap-3">
    {/* LOẠI XE */}
    {selectedType && (
      <View className="flex-row items-center bg-gray-100 px-4 py-2 rounded-full border border-gray-300">
        <Text className="text-gray-700 font-semibold text-sm">
           {selectedType}
        </Text>
      </View>
    )}

    {/* KHU VỰC */}
    {selectedLocation && (
      <View className="flex-row items-center bg-gray-100 px-4 py-2 rounded-full border border-gray-300">
        <Text className="text-gray-700 font-semibold text-sm">
           {selectedLocation}
        </Text>
      </View>
    )}

    {/* GIÁ */}
    {maxPrice < 30000000 && (
      <View className="flex-row items-center bg-gray-100 px-4 py-2 rounded-full border border-gray-300">
        <Text className="text-gray-700 font-semibold text-sm">
          ≤ {maxPrice.toLocaleString()} đ
        </Text>
      </View>
    )}
  </View>
)}



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
                  onPress={() =>
                    setSelectedType(
                      selectedType === item.value ? null : item.value
                    )
                  }
                  className={`py-2 border-b border-gray-200 ${
                    selectedType === item.value
                      ? "bg-pink-100 rounded-lg px-2"
                      : ""
                  }`}
                >
                  <Text
                    className={
                      selectedType === item.value
                        ? "text-pink-600 font-semibold"
                        : "text-gray-700"
                    }
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* LOCATION */}
            <View>
              <Text className="font-semibold mb-2">Khu vực</Text>

              {[
                { label: " TP.HCM", value: "HCM" },
                { label: " Hà Nội", value: "HN" },
              ].map((item) => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() =>
                    setSelectedLocation(
                      selectedLocation === item.value ? null : item.value
                    )
                  }
                  className={`py-2 border-b border-gray-200 ${
                    selectedLocation === item.value
                      ? "bg-pink-100 rounded-lg px-2"
                      : ""
                  }`}
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
                maximumValue={30000000}
                step={50000}
                value={maxPrice}
                onValueChange={setMaxPrice}
                minimumTrackTintColor="#e11d48"
                maximumTrackTintColor="#e5e7eb"
                thumbTintColor="#e11d48"
              />
            </View>
          </View>
        )}
      </View>

      {/* XE NỔI BẬT (ẨN KHI ĐANG LỌC) */}
      {!isFiltering && (
  <>
    <Text className="text-lg font-bold mt-6 mb-3">Xe nổi bật ⭐</Text>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="pl-1"
    >
      {featuredVehicles.map((v) => (
        <TouchableOpacity
          key={v.id}
          onPress={() =>
            router.push({
              pathname: "/vehicle/[id]",
              params: { id: v.id },
            })
          }
          className="w-56 bg-white rounded-2xl mr-4 overflow-hidden border border-gray-200"
        >
          {/* IMAGE */}
          <View className="relative">
            <Image
              source={{
                uri:
                  v.images && v.images.length > 0
                    ? v.images[0]
                    : "https://via.placeholder.com/300",
              }}
              className="w-full h-32"
              resizeMode="cover"
            />

            {/* RATING */}
            <View className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full flex-row items-center">
          <Text className="text-yellow-500 text-xs">★</Text>
          <Text className="text-xs font-semibold ml-1">
            {v.ratingAvg >= 0 ? v.ratingAvg.toFixed(1) :""}
          </Text>
        </View>

            {/* TYPE BADGE */}
            {v.type === "xe máy" && (
              <View className="absolute top-2 left-2 bg-pink-600 px-2 py-1 rounded-full">
                <Text className="text-white text-xs font-semibold">
                  Xe máy
                </Text>
              </View>
            )}
          </View>

          {/* INFO */}
          <View className="p-3">
            <Text className="font-semibold text-sm" numberOfLines={1}>
              {v.name}
            </Text>

            <Text className="text-xs text-gray-500 mt-1">
              {v.brand}
            </Text>

            <Text className="text-pink-600 font-bold mt-2">
              {v.price.toLocaleString()} đ
              <Text className="text-gray-500 font-normal text-xs">
                /ngày
              </Text>
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </>
)}


      {/* TẤT CẢ XE */}
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
      className="w-[48%] bg-white rounded-2xl mb-6 overflow-hidden border border-gray-200"
    >
      {/* IMAGE */}
      <View className="relative">
        <Image
          source={{
            uri:
              v.images && v.images.length > 0
                ? v.images[0]
                : "https://via.placeholder.com/300",
          }}
          className="w-full h-48"
          resizeMode="cover"
  
        />

        {/* RATING */}
        <View className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full flex-row items-center">
          <Text className="text-yellow-500 text-xs">★</Text>
          <Text className="text-xs font-semibold ml-1">
            {v.ratingAvg >= 0 ? v.ratingAvg.toFixed(1) :""}
          </Text>
        </View>

        {/* TYPE BADGE */}
        {v.type === "xe máy" && (
          <View className="absolute top-2 left-2 bg-pink-600 px-2 py-1 rounded-full">
            <Text className="text-white text-xs font-semibold">Xe máy</Text>
          </View>
        )}
      </View>

      {/* INFO */}
      <View className="p-3">
        <Text className="font-semibold text-sm" numberOfLines={1}>
          {v.name}
        </Text>

        <Text className="text-xs text-gray-500 mt-1">
          {v.brand}
        </Text>

        <Text className="text-pink-600 font-bold mt-2">
          {v.price.toLocaleString()} đ
          <Text className="text-gray-500 font-normal text-xs">/ngày</Text>
        </Text>
      </View>
    </TouchableOpacity>
  ))}
</View>

<View className="h-6" />


      <View className="h-6" />
    </ScrollView>
  );
}
