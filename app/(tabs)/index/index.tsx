import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
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

  useEffect(() => {
    getAllVehicles().then(setVehicles);
  }, []);

  const {
    searchText,
    setSearchText,

    selectedType,
    selectedLocation,
    maxPrice,
    setSelectedType,
    setSelectedLocation,
    setMaxPrice,
    resetFilters,
    locations,
    filteredVehicles,
    isFiltering,
    user,
  } = useVehicles(vehicles);

  const featuredVehicles = vehicles.slice(0, 3);

  return (
    <ScrollView className="flex-1 bg-white px-4 pt-4">
      {/* HEADER */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-xl font-bold">RentRide</Text>

        <TouchableOpacity
          onPress={() => router.push("/profile")}
          className="w-10 h-10 rounded-full overflow-hidden bg-gray-200"
        >
          <Image
            source={{
              uri:
                user?.avatar ||
                "https://ui-avatars.com/api/?name=User&background=F3F4F6",
            }}
            className="w-full h-full"
          />
        </TouchableOpacity>
      </View>
      {/* SEARCH */}
      <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3 mt-4">
        <Ionicons name="search-outline" size={20} color="#9CA3AF" />
        <TextInput
          placeholder="Tìm kiếm xe..."
          value={searchText}
          onChangeText={setSearchText}
          className="flex-1 ml-3 text-base"
        />
      </View>

      {/* CATEGORY HEADER */}
      <View className="mt-4">
        <TouchableOpacity
          className="flex-row items-center justify-between"
          onPress={() => setOpenCategory(!openCategory)}
        >
          <Text className="font-bold text-base">Bộ lọc</Text>
          <Ionicons
            name={openCategory ? "chevron-up" : "chevron-down"}
            size={20}
          />
        </TouchableOpacity>

        {/* 🔹 THANH THÔNG TIN LỌC NẰM NGANG */}
        {isFiltering && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
          >
            <View className="flex-row gap-3">
              {selectedType && (
                <View className="px-4 py-2 bg-gray-100 rounded-full border">
                  <Text className="text-sm font-semibold">
                    🚘 {selectedType}
                  </Text>
                </View>
              )}

              {selectedLocation && (
                <View className="px-4 py-2 bg-gray-100 rounded-full border">
                  <Text className="text-sm font-semibold">
                    🗺️ {selectedLocation}
                  </Text>
                </View>
              )}

              {maxPrice < 30000000 && (
                <View className="px-4 py-2 bg-gray-100 rounded-full border">
                  <Text className="text-sm font-semibold">
                    💰 ≤ {maxPrice.toLocaleString()} đ
                  </Text>
                </View>
              )}

              {/* XÓA */}
              <TouchableOpacity
                onPress={resetFilters}
                className="px-4 py-2 bg-red-100 rounded-full border border-red-300"
              >
                <Text className="text-sm font-semibold text-red-600">Xóa</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* FILTER PANEL */}
        {openCategory && (
          <View className="mt-4 bg-gray-50 rounded-xl p-4 space-y-4">
            {/* TYPE */}
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
                      selectedType === item.value ? null : item.value,
                    )
                  }
                  className={`py-2 ${
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

              <View className="flex-row flex-wrap gap-2">
                {locations.map((loc) => (
                  <TouchableOpacity
                    key={loc}
                    onPress={() =>
                      setSelectedLocation(selectedLocation === loc ? null : loc)
                    }
                    className={`px-3 py-2 rounded-full border ${
                      selectedLocation === loc
                        ? "bg-pink-100 border-pink-400"
                        : "bg-white"
                    }`}
                  >
                    <Text
                      className={
                        selectedLocation === loc
                          ? "text-pink-600 font-semibold"
                          : "text-gray-700"
                      }
                    >
                      🗺️ {loc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* PRICE */}
            <View>
              <Text className="font-semibold mb-2">Giá</Text>
              <Text className="text-gray-500 mb-3">
                0 – {maxPrice.toLocaleString()} đ
              </Text>
              <Slider
                minimumValue={0}
                maximumValue={30000000}
                step={50000}
                value={maxPrice}
                onValueChange={setMaxPrice}
              />
            </View>
          </View>
        )}
      </View>

      {/* FEATURED */}
      {!isFiltering && (
        <>
          <Text className="text-lg font-bold mt-6 mb-3">Xe nổi bật ⭐</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featuredVehicles.map((v) => (
              <TouchableOpacity
                key={v.id}
                className="w-56 mr-4 bg-white rounded-xl overflow-hidden"
                onPress={() =>
                  router.push({
                    pathname: "/vehicle/[id]",
                    params: { id: v.id },
                  })
                }
              >
                {/* IMAGE + RATING */}
                <View className="relative">
                  <Image
                    source={{ uri: v.images?.[0] }}
                    className="w-full h-32"
                  />
                </View>

                {/* INFO */}
                <View className="p-3">
                  <Text className="font-semibold">{v.name}</Text>

                  {/* BRAND */}
                  <Text className="text-xs text-gray-500 mt-0.5">
                    {v.brand || "Không rõ hãng"}
                  </Text>

                  {/* PRICE */}
                  <Text className="text-pink-600 font-bold mt-1">
                    {v.price.toLocaleString()} đ/ngày
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {/* ALL VEHICLES */}
      <Text className="text-lg font-bold mt-8 mb-4">Tất cả xe</Text>
      <View className="flex-row flex-wrap justify-between">
        {filteredVehicles.map((v) => (
          <TouchableOpacity
            key={v.id}
            className="w-[48%] mb-6 bg-white rounded-xl overflow-hidden"
            onPress={() =>
              router.push({
                pathname: "/vehicle/[id]",
                params: { id: v.id },
              })
            }
          >
            {/* IMAGE + RATING */}
            <View className="relative">
              <Image source={{ uri: v.images?.[0] }} className="w-full h-48" />
            </View>

            {/* INFO */}
            <View className="p-2">
              <Text className="font-semibold">{v.name}</Text>

              {/* BRAND */}
              <Text className="text-xs text-gray-500 mt-0.5">
                {v.brand || "Không rõ hãng"}
              </Text>

              <Text className="text-pink-600 font-bold mt-1">
                {v.price.toLocaleString()} đ/ngày
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
