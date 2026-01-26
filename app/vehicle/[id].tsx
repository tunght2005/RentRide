import { getVehicleById } from "@/lib/firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(
    new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDateType, setSelectedDateType] = useState<"start" | "end">(
    "start",
  );
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const flatListRef = useRef<FlatList>(null);
  const { width } = Dimensions.get("window");

  const TYPE_CONFIG: Record<
    string,
    { label: string; bg: string; text: string }
  > = {
    "ô tô": {
      label: "🚗 Ô tô",
      bg: "bg-pink-100",
      text: "text-pink-600",
    },
    "xe máy": {
      label: "🏍 Xe máy",
      bg: "bg-blue-100",
      text: "text-blue-600",
    },
    "xe đạp": {
      label: "🚲 Xe đạp",
      bg: "bg-green-100",
      text: "text-green-600",
    },
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      const newIndex = currentImageIndex - 1;
      setCurrentImageIndex(newIndex);
      flatListRef.current?.scrollToIndex({
        index: newIndex,
        animated: true,
      });
    }
  };

  const handleNextImage = () => {
    const images = vehicle?.images || [];
    if (currentImageIndex < images.length - 1) {
      const newIndex = currentImageIndex + 1;
      setCurrentImageIndex(newIndex);
      flatListRef.current?.scrollToIndex({
        index: newIndex,
        animated: true,
      });
    }
  };

  const calculateRentalDays = () => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    return Math.max(1, diffDays);
  };

  const rentalDays = calculateRentalDays();
  const totalPrice = (vehicle?.price || 0) * rentalDays;

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const openDatePicker = (type: "start" | "end") => {
    setSelectedDateType(type);
    setTempDate(type === "start" ? startDate : endDate);
    setShowDatePicker(true);
  };

  const handleDateConfirm = () => {
    if (selectedDateType === "start") {
      setStartDate(tempDate);
    } else {
      setEndDate(tempDate);
    }
    setShowDatePicker(false);
  };

  const changeDay = (offset: number) => {
    const newDate = new Date(tempDate);
    newDate.setDate(newDate.getDate() + offset);
    setTempDate(newDate);
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
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View className="flex-row items-center px-4 pt-4 pb-3 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>

        <Text className="text-lg font-bold ml-2 flex-1" numberOfLines={1}>
          {vehicle.name}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* IMAGE CAROUSEL */}
        <View className="relative bg-gray-100">
          <FlatList
            ref={flatListRef}
            data={vehicle?.images || []}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={{ width, height: 280 }}
                resizeMode="cover"
              />
            )}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            scrollEnabled={false}
            pagingEnabled={true}
          />

          {/* TYPE BADGE */}
          <View className="absolute top-4 left-4">
            {vehicleTypes[0] && (
              <Text
                className={`${TYPE_CONFIG[vehicleTypes[0].toLowerCase()]?.bg || "bg-pink-100"} ${TYPE_CONFIG[vehicleTypes[0].toLowerCase()]?.text || "text-pink-600"} px-3 py-2 rounded-full text-xs font-semibold`}
              >
                {TYPE_CONFIG[vehicleTypes[0].toLowerCase()]?.label}
              </Text>
            )}
          </View>

          {/* IMAGE NAVIGATION */}
          {vehicle?.images?.length > 1 && (
            <>
              <TouchableOpacity
                onPress={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 opacity-90"
              >
                <Ionicons name="chevron-back" size={24} color="#000" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 opacity-90"
              >
                <Ionicons name="chevron-forward" size={24} color="#000" />
              </TouchableOpacity>
            </>
          )}

          {/* DOT INDICATORS */}
          <View className="absolute bottom-3 left-1/2 -translate-x-1/2 flex-row gap-1">
            {vehicle?.images?.map((_: string, index: number) => (
              <View
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentImageIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </View>
        </View>

        {/* VEHICLE INFO */}
        <View className="px-4 pt-4">
          {/* TITLE & RATING */}
          <View className="flex-row items-start justify-between mb-4">
            <View className="flex-1">
              <Text className="text-xl font-bold text-black">
                {vehicle.name}
              </Text>
              <Text className="text-gray-600 text-sm mt-1">
                {vehicle.brand} - {vehicle.year} - {vehicle.plate} -
                <View className="flex-row items-center gap-2 mt-2">
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <Text className="text-gray-600 text-sm">
                    {vehicle.locationId}
                  </Text>
                </View>
              </Text>
            </View>

            <View className="flex-row items-center bg-yellow-50 px-3 py-2 rounded-lg">
              <Ionicons name="star" size={16} color="#FFB800" />
              <Text className="font-semibold ml-1">
                {vehicle.ratingAvg ?? 4.8}
              </Text>
              <Text className="text-gray-600 text-xs ml-1">
                ({vehicle.ratingCount ?? 0})
              </Text>
            </View>
          </View>

          {/* PRICE */}
          <View className="mb-4">
            <Text className="text-pink-600 text-2xl font-bold">
              {vehicle.price?.toLocaleString()} đ
              <Text className="text-gray-600 font-normal text-sm">/ngày</Text>
            </Text>
          </View>

          {/* VEHICLE FEATURES */}
          <View className="flex-row justify-around py-4 bg-gray-50 rounded-xl mb-6">
            {/* SEATS */}
            <View className="items-center">
              <View className="w-12 h-12 rounded-full bg-pink-100 items-center justify-center mb-2">
                <Ionicons name="people" size={20} color="#EC4899" />
              </View>
              <Text className="text-xs text-gray-600">Chỗ ngồi</Text>
              <Text className="font-bold text-base">{vehicle.seats || 5}</Text>
            </View>

            {/* TRANSMISSION */}
            <View className="items-center">
              <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mb-2">
                <Ionicons name="settings" size={20} color="#3B82F6" />
              </View>
              <Text className="text-xs text-gray-600">Hộp số</Text>
              <Text className="font-bold text-base">
                {vehicle.transmission}
              </Text>
            </View>

            {/* DOCUMENTS */}
            <View className="items-center">
              <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mb-2">
                <Ionicons name="document" size={20} color="#10B981" />
              </View>
              <Text className="text-xs text-gray-600">Nhiên liệu</Text>
              <Text className="font-bold text-base">{vehicle.fuel || "—"}</Text>
            </View>
          </View>

          {/* DESCRIPTION */}
          {vehicle.description && (
            <>
              <Text className="font-bold text-base text-black mb-2">Mô tả</Text>
              <Text className="text-gray-700 leading-6 mb-6">
                {vehicle.description}
              </Text>
            </>
          )}

          {/* OWNER INFO */}
          {vehicle.owner && (
            <>
              <Text className="font-bold text-base text-black mb-3">
                Chủ sở hữu
              </Text>
              <View className="flex-row items-center p-4 bg-gray-50 rounded-xl mb-6">
                <View className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 items-center justify-center">
                  <Text className="text-white font-bold">
                    {vehicle.owner?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-semibold text-black">
                    {vehicle.owner}
                  </Text>
                  <Text className="text-gray-600 text-xs">Người cho thuê</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </View>
            </>
          )}
        </View>
        {/* BOOKING SECTION */}
        <View className="bg-white border-t border-gray-200">
          {/* DATE SELECTION */}
          <View className="px-4 pt-4 pb-4">
            <View className="flex-row items-center gap-2 mb-4">
              <Ionicons name="calendar" size={20} color="#EC4899" />
              <Text className="text-lg font-bold text-black">
                Chọn ngày thuê
              </Text>
            </View>

            <View className="flex-row gap-3">
              {/* START DATE */}
              <View className="flex-1">
                <Text className="text-gray-600 text-sm mb-2">Ngày bắt đầu</Text>
                <TouchableOpacity
                  onPress={() => openDatePicker("start")}
                  className="flex-row items-center justify-between border border-gray-300 rounded-xl px-4 py-3 bg-gray-50"
                >
                  <Text className="font-semibold text-black">
                    {formatDate(startDate)}
                  </Text>
                  <Ionicons name="calendar" size={20} color="#999" />
                </TouchableOpacity>
              </View>

              {/* END DATE */}
              <View className="flex-1">
                <Text className="text-gray-600 text-sm mb-2">
                  Ngày kết thúc
                </Text>
                <TouchableOpacity
                  onPress={() => openDatePicker("end")}
                  className="flex-row items-center justify-between border border-gray-300 rounded-xl px-4 py-3 bg-gray-50"
                >
                  <Text className="font-semibold text-black">
                    {formatDate(endDate)}
                  </Text>
                  <Ionicons name="calendar" size={20} color="#999" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* PRICE CALCULATION */}
          <View className="px-4 py-4 border-t border-gray-200">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-600">
                {vehicle?.price?.toLocaleString()} đ × {rentalDays} ngày
              </Text>
              <Text className="font-semibold text-black">
                {totalPrice.toLocaleString()} đ
              </Text>
            </View>

            <View className="flex-row justify-between items-center pt-3 border-t border-gray-200">
              <Text className="text-gray-600">Tổng tiền</Text>
              <Text className="text-2xl font-bold text-pink-600">
                {totalPrice.toLocaleString()} đ
              </Text>
            </View>
          </View>
          {/* BOOK BUTTON */}
          <View className="px-4 pb-6 pt-4">
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/vehicle/contract",
                  params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    totalPrice: totalPrice.toString(),
                    rentalDays: rentalDays.toString(),
                    pricePerDay: (vehicle?.price || 0).toString(),
                    vehicleId: id,
                    vehicleImage: vehicle?.images[1],
                    vehicleName: vehicle?.name,
                    vehicleBrand: vehicle?.brand,
                    vehicleYear: vehicle?.year?.toString(), // Thêm năm sản xuất
                    licensePlate: vehicle?.plate, // Thêm biển số xe
                  },
                })
              }
              className="bg-pink-600 py-4 rounded-2xl active:opacity-80"
            >
              <Text className="text-white text-center font-bold text-base">
                Đặt xe ngay
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* DATE PICKER MODAL */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 pb-10">
            {/* HEADER */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-lg font-bold text-black">
                {selectedDateType === "start"
                  ? "Chọn ngày bắt đầu"
                  : "Chọn ngày kết thúc"}
              </Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={28} color="#000" />
              </TouchableOpacity>
            </View>

            {/* DATE DISPLAY */}
            <View className="bg-pink-50 rounded-2xl p-6 mb-6 items-center">
              <Text className="text-gray-600 text-sm mb-2">Ngày được chọn</Text>
              <Text className="text-4xl font-bold text-pink-600 mb-2">
                {tempDate.getDate()}
              </Text>
              <Text className="text-lg text-black font-semibold">
                {formatDate(tempDate)}
              </Text>
            </View>

            {/* DATE PICKER CONTROLS */}
            <View className="mb-6">
              {/* MONTH/YEAR SELECTOR */}
              <View className="flex-row justify-between items-center mb-6 px-4">
                <TouchableOpacity
                  onPress={() => {
                    const newDate = new Date(tempDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setTempDate(newDate);
                  }}
                  className="p-2"
                >
                  <Ionicons name="chevron-back" size={24} color="#EC4899" />
                </TouchableOpacity>

                <Text className="text-lg font-bold text-black">
                  Tháng {String(tempDate.getMonth() + 1).padStart(2, "0")}/
                  {tempDate.getFullYear()}
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    const newDate = new Date(tempDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setTempDate(newDate);
                  }}
                  className="p-2"
                >
                  <Ionicons name="chevron-forward" size={24} color="#EC4899" />
                </TouchableOpacity>
              </View>

              {/* DAY SELECTOR */}
              <View className="flex-row justify-between items-center mb-4 px-2">
                <Text className="text-xs font-bold text-gray-600 w-12 text-center">
                  T2
                </Text>
                <Text className="text-xs font-bold text-gray-600 w-12 text-center">
                  T3
                </Text>
                <Text className="text-xs font-bold text-gray-600 w-12 text-center">
                  T4
                </Text>
                <Text className="text-xs font-bold text-gray-600 w-12 text-center">
                  T5
                </Text>
                <Text className="text-xs font-bold text-gray-600 w-12 text-center">
                  T6
                </Text>
                <Text className="text-xs font-bold text-gray-600 w-12 text-center">
                  T7
                </Text>
                <Text className="text-xs font-bold text-gray-600 w-12 text-center">
                  CN
                </Text>
              </View>

              {/* CALENDAR GRID */}
              <CalendarGrid
                date={tempDate}
                onSelectDay={(day) => {
                  const newDate = new Date(tempDate);
                  newDate.setDate(day);
                  setTempDate(newDate);
                }}
                selectedDate={tempDate.getDate()}
              />
            </View>

            {/* ACTION BUTTONS */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                className="flex-1 border border-gray-300 rounded-xl py-3"
              >
                <Text className="text-center font-semibold text-black">
                  Hủy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDateConfirm}
                className="flex-1 bg-pink-600 rounded-xl py-3"
              >
                <Text className="text-center font-semibold text-white">
                  Chọn
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const CalendarGrid = ({
  date,
  onSelectDay,
  selectedDate,
}: {
  date: Date;
  onSelectDay: (day: number) => void;
  selectedDate: number;
}) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Create array of days including empty slots
  const days: (number | null)[] = [];

  // Add empty slots before first day
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }

  // Add days of month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Create rows (each row has 7 days)
  const rows: (number | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    rows.push(days.slice(i, i + 7));
  }

  return (
    <View>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row mb-2">
          {row.map((day, colIndex) => (
            <View key={colIndex} className="flex-1 items-center py-3">
              {day !== null ? (
                <TouchableOpacity
                  onPress={() => onSelectDay(day)}
                  className={`w-10 h-10 rounded-lg items-center justify-center ${
                    day === selectedDate ? "bg-pink-600" : "bg-transparent"
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      day === selectedDate ? "text-white" : "text-black"
                    }`}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View className="w-10 h-10" />
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};
