import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
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

  useEffect(() => {
    getAllVehicles().then(setVehicles);
  }, []);

  useEffect(() => {
    // Chỉ chạy trên web (VNPAY redirect)
    if (Platform.OS === "web") {
      const success = localStorage.getItem("payment_success");

      if (success === "true") {
        Alert.alert(
          "Thanh toán thành công",
          "Cảm ơn bạn đã sử dụng dịch vụ RentRide",
        );

        localStorage.removeItem("payment_success");
      }
    }
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
    rentingVehicles,
    locations,
    filteredVehicles,
    isFiltering,
    user,
  } = useVehicles(vehicles);

  const featuredVehicles = filteredVehicles.slice(0, 3);

  // Component
  const renderVehicleItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      key={item.id}
      className="w-[48%] mb-6 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
      onPress={() =>
        router.push({
          pathname: "/vehicle/[id]",
          params: { id: item.id },
        })
      }
    >
      <View className="relative">
        <Image source={{ uri: item.images?.[0] }} className="w-full h-40" />
      </View>
      <View className="p-2">
        <Text className="font-semibold" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-xs text-gray-500 mt-0.5">
          {item.brand || "Không rõ hãng"}
        </Text>
        <Text className="text-pink-600 font-bold mt-1">
          {item.price.toLocaleString()} đ/ngày
        </Text>
      </View>
    </TouchableOpacity>
  );
  const ListHeader = () => (
    <View className="pt-4">
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

      {/* FILTER */}
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

        {isFiltering && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
          >
            <View className="flex-row gap-3">
              {selectedType && (
                <View className="px-4 py-2 bg-gray-100 rounded-full border border-gray-200">
                  <Text className="text-sm font-semibold">
                    🚘 {selectedType}
                  </Text>
                </View>
              )}
              {selectedLocation && (
                <View className="px-4 py-2 bg-gray-100 rounded-full border border-gray-200">
                  <Text className="text-sm font-semibold">
                    🗺️ {selectedLocation}
                  </Text>
                </View>
              )}
              {maxPrice < 30000000 && (
                <View className="px-4 py-2 bg-gray-100 rounded-full border border-gray-200">
                  <Text className="text-sm font-semibold">
                    💰 ≤ {maxPrice.toLocaleString()} đ
                  </Text>
                </View>
              )}
              <TouchableOpacity
                onPress={resetFilters}
                className="px-4 py-2 bg-red-100 rounded-full border border-red-300"
              >
                <Text className="text-sm font-semibold text-red-600">Xóa</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {openCategory && (
          <View className="mt-4 bg-gray-50 rounded-xl p-4">
            <Text className="font-semibold mb-2">Loại xe</Text>
            <View className="mb-4">
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
                  className={`py-2 mb-1 ${selectedType === item.value ? "bg-pink-100 rounded-lg px-2" : ""}`}
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

            <Text className="font-semibold mb-2">Khu vực</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {locations.map((loc) => (
                <TouchableOpacity
                  key={loc}
                  onPress={() =>
                    setSelectedLocation(selectedLocation === loc ? null : loc)
                  }
                  className={`px-3 py-2 rounded-full border ${selectedLocation === loc ? "bg-pink-100 border-pink-400" : "bg-white border-gray-200"}`}
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

            <Text className="font-semibold mb-2">
              Giá: {maxPrice.toLocaleString()} đ
            </Text>
            <Slider
              minimumValue={0}
              maximumValue={30000000}
              step={50000}
              value={maxPrice}
              onValueChange={setMaxPrice}
            />
          </View>
        )}
      </View>

      {!isFiltering && featuredVehicles.length > 0 && (
        <>
          <Text className="text-lg font-bold mt-6 mb-3">Xe nổi bật ⭐</Text>
          <FlatList
            horizontal
            data={featuredVehicles}
            keyExtractor={(item) => `featured-${item.id}`}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="w-56 mr-4 bg-white rounded-xl overflow-hidden shadow-sm"
                onPress={() =>
                  router.push({
                    pathname: "/vehicle/[id]",
                    params: { id: item.id },
                  })
                }
              >
                <Image
                  source={{ uri: item.images?.[0] }}
                  className="w-full h-32"
                />
                <View className="p-3">
                  <Text className="font-semibold">{item.name}</Text>
                  <Text className="text-pink-600 font-bold mt-1">
                    {item.price.toLocaleString()} đ
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      {!isFiltering && rentingVehicles.length > 0 && (
        <>
          <Text className="text-lg font-bold mt-6 mb-3">Xe đang thuê 🔑</Text>
          <FlatList
            horizontal
            data={rentingVehicles}
            keyExtractor={(item, index) => `renting-${item.id}-${index}`}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="w-56 mr-4 bg-white rounded-xl overflow-hidden border border-green-100 shadow-sm"
                onPress={() =>
                  router.push({
                    pathname: "/vehicle/[id]",
                    params: { id: item.id },
                  })
                }
              >
                <View className="relative">
                  <Image
                    source={{ uri: item.images?.[0] }}
                    className="w-full h-32"
                  />
                  <View className="absolute top-2 right-2 bg-green-500 px-2 py-1 rounded">
                    <Text className="text-white text-[10px] font-bold">
                      ĐANG THUÊ
                    </Text>
                  </View>
                </View>
                <View className="p-3">
                  <Text className="font-semibold" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {item.licensePlate}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      <Text className="text-lg font-bold mt-8 mb-4">Tất cả xe</Text>
    </View>
  );

  return (
    <FlatList
      data={filteredVehicles}
      renderItem={renderVehicleItem}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: "space-between" }}
      ListHeaderComponent={ListHeader}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
      className="flex-1 bg-white"
      showsVerticalScrollIndicator={false}
    />
  );
}
