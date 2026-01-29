import { useBookings } from "@/hooks/useBookings";
import { getVehicleById } from "@/lib/firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
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
  const { bookings } = useBookings(getAuth().currentUser?.uid);
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDateType, setSelectedDateType] = useState<"start" | "end">(
    "start",
  );
  const [tempDate, setTempDate] = useState(new Date());
  const flatListRef = useRef<FlatList>(null);
  const { width } = Dimensions.get("window");

  const isRented = bookings.some(
    (b) =>
      b.vehicle?.id === id &&
      (b.status?.toLowerCase() === "paid" ||
        b.status?.toLowerCase() === "completed"),
  );

  useEffect(() => {
    if (id)
      getVehicleById(id).then((data) => {
        setVehicle(data);
        setLoading(false);
      });
  }, [id]);

  const formatDate = (date: Date) => {
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  };

  const rentalDays = Math.max(
    1,
    Math.ceil(
      Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    ),
  );
  const totalPrice = (vehicle?.price || 0) * rentalDays;

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (!vehicle)
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Không tìm thấy xe</Text>
      </View>
    );

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center px-4 pt-4 pb-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} />
        </TouchableOpacity>
        <Text className="text-lg font-bold ml-2 flex-1" numberOfLines={1}>
          {vehicle.name}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="relative bg-gray-100">
          <FlatList
            ref={flatListRef}
            data={vehicle?.images || []}
            horizontal
            pagingEnabled
            scrollEnabled={false}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={{ width, height: 280 }}
                resizeMode="cover"
              />
            )}
          />
          <View className="absolute bottom-3 left-1/2 -translate-x-1/2 flex-row gap-1">
            {vehicle?.images?.map((_: any, i: number) => (
              <View
                key={i}
                className={`w-2 h-2 rounded-full ${i === currentImageIndex ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </View>
        </View>

        <View className="px-4 pt-4">
          <View className="flex-row justify-between mb-4">
            <View className="flex-1">
              <Text className="text-xl font-bold">{vehicle.name}</Text>
              <Text className="text-gray-500 text-sm mt-1">
                📍 {vehicle.locationId}
              </Text>
            </View>
            <View className="bg-yellow-50 px-3 py-2 rounded-lg flex-row items-center">
              <Ionicons name="star" size={16} color="#FFB800" />
              <Text className="font-semibold ml-1">
                {vehicle.ratingAvg ?? 4.8}
              </Text>
            </View>
          </View>
          <Text className="text-pink-600 text-2xl font-bold mb-6">
            {vehicle.price?.toLocaleString()} đ
            <Text className="text-gray-500 text-sm font-normal">/ngày</Text>
          </Text>

          <View className="flex-row justify-around py-4 bg-gray-50 rounded-xl mb-6">
            <FeatureIcon
              icon="people"
              label="Chỗ ngồi"
              value={vehicle.seats || 5}
              color="#EC4899"
              bg="bg-pink-100"
            />
            <FeatureIcon
              icon="settings"
              label="Hộp số"
              value={vehicle.transmission}
              color="#3B82F6"
              bg="bg-blue-100"
            />
            <FeatureIcon
              icon="leaf"
              label="Nhiên liệu"
              value={vehicle.fuel || "Xăng"}
              color="#10B981"
              bg="bg-green-100"
            />
          </View>

          <Text className="font-bold text-base mb-2">Mô tả</Text>
          <Text className="text-gray-700 leading-6 mb-6">
            {vehicle.description}
          </Text>
        </View>

        {!isRented ? (
          <View className="border-t border-gray-100 p-4">
            <Text className="text-lg font-bold mb-4">📅 Chọn ngày thuê</Text>
            <View className="flex-row gap-3 mb-6">
              <DateButton
                label="Bắt đầu"
                date={formatDate(startDate)}
                onPress={() => {
                  setSelectedDateType("start");
                  setTempDate(startDate);
                  setShowDatePicker(true);
                }}
              />
              <DateButton
                label="Kết thúc"
                date={formatDate(endDate)}
                onPress={() => {
                  setSelectedDateType("end");
                  setTempDate(endDate);
                  setShowDatePicker(true);
                }}
              />
            </View>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-500">
                Tổng tiền ({rentalDays} ngày)
              </Text>
              <Text className="text-xl font-bold text-pink-600">
                {totalPrice.toLocaleString()} đ
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/vehicle/contract",
                  params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    totalPrice: totalPrice.toString(),
                    rentalDays: rentalDays.toString(),
                    vehicleId: id,
                    vehicleName: vehicle.name,
                    vehicleImage: vehicle.images[0],
                    licensePlate: vehicle.plate,
                  },
                })
              }
              className="bg-pink-600 py-4 rounded-2xl"
            >
              <Text className="text-white text-center font-bold text-base">
                Đặt xe ngay
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="p-6 border-t border-gray-100">
            <View className="bg-green-50 p-5 rounded-2xl items-center border border-green-100">
              <Ionicons name="checkmark-circle" size={32} color="#10B981" />
              <Text className="text-green-700 font-bold text-lg mt-2">
                Bạn đang thuê xe này
              </Text>
              <Text className="text-green-600 text-xs text-center mt-1 text-pretty">
                Hợp đồng của bạn hiện đang có hiệu lực.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/profile")}
              className="mt-4 bg-gray-50 py-4 rounded-2xl border border-gray-200"
            >
              <Text className="text-center font-bold text-gray-700">
                Xem hợp đồng
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal visible={showDatePicker} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-lg font-bold">
                {selectedDateType === "start"
                  ? "Ngày bắt đầu"
                  : "Ngày kết thúc"}
              </Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={28} />
              </TouchableOpacity>
            </View>
            <CalendarGrid
              date={tempDate}
              selectedDate={tempDate.getDate()}
              onSelectDay={(day: number) => {
                const d = new Date(tempDate);
                d.setDate(day);
                setTempDate(d);
              }}
            />
            <View className="flex-row gap-3 mt-6">
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl"
              >
                <Text className="text-center">Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (selectedDateType === "start") setStartDate(tempDate);
                  else setEndDate(tempDate);
                  setShowDatePicker(false);
                }}
                className="flex-1 bg-pink-600 py-3 rounded-xl"
              >
                <Text className="text-center text-white font-bold">
                  Xác nhận
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Helper Components
const FeatureIcon = ({ icon, label, value, color, bg }: any) => (
  <View className="items-center">
    <View
      className={`w-11 h-11 rounded-full ${bg} items-center justify-center mb-1`}
    >
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text className="text-[10px] text-gray-500">{label}</Text>
    <Text className="font-bold">{value}</Text>
  </View>
);

const DateButton = ({ label, date, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50"
  >
    <Text className="text-gray-500 text-[10px] mb-1">{label}</Text>
    <Text className="font-bold">{date}</Text>
  </TouchableOpacity>
);

const CalendarGrid = ({
  date,
  onSelectDay,
  selectedDate,
}: {
  date: Date;
  onSelectDay: (day: number) => void;
  selectedDate: number;
}) => {
  const daysInMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const days = Array(firstDay === 0 ? 6 : firstDay - 1)
    .fill(null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  return (
    <View className="flex-row flex-wrap">
      {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
        <Text
          key={d}
          className="w-[14.2%] text-center text-xs text-gray-400 mb-2"
        >
          {d}
        </Text>
      ))}
      {days.map((day, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => day && onSelectDay(day)}
          className={`w-[14.2%] h-10 items-center justify-center rounded-lg ${day === selectedDate ? "bg-pink-600" : ""}`}
        >
          <Text
            className={
              day === selectedDate ? "text-white font-bold" : "text-black"
            }
          >
            {day || ""}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
