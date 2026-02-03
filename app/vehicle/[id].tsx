import { useBookings } from "@/hooks/useBookings";
import { getVehicleById, db } from "@/lib/firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
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
  const [showContractsModal, setShowContractsModal] = useState(false);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
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
  // Lấy hợp đồng của user và xe
  const fetchContracts = async () => {
    const user = getAuth().currentUser;
    if (!user?.uid) return;

    setLoadingContracts(true);
    try {
      const contractsRef = collection(db, "contracts");

      const q = query(
        contractsRef,
        where("userId", "==", user.uid),
        where("vehicle.id", "==", id),
      );
      const snapshot = await getDocs(q);

      const contractsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      contractsList.sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setContracts(contractsList);
    } catch (error) {
      console.error("Error fetching contracts:", error);
    } finally {
      setLoadingContracts(false);
    }
  };

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
            scrollEnabled={true}
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
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
                    pricePerDay: (vehicle?.price || 0).toString(),
                    vehicleId: id,
                    vehicleImage: vehicle?.images[0],
                    vehicleName: vehicle?.name,
                    vehicleBrand: vehicle?.brand,
                    vehicleYear: vehicle?.year?.toString(),
                    licensePlate: vehicle?.plate,
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
              onPress={() => {
                setShowContractsModal(true);
                fetchContracts();
              }}
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

      {/* Contracts Modal */}
      <Modal
        visible={showContractsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowContractsModal(false)}
      >
        <View className="flex-1 bg-black/50">
          <View className="flex-1 bg-white mt-20 rounded-t-3xl">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-lg font-bold">Hợp đồng của tôi</Text>
              <TouchableOpacity
                onPress={() => setShowContractsModal(false)}
                className="p-2"
              >
                <Ionicons name="close" size={28} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            {loadingContracts ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#EC4899" />
                <Text className="text-gray-600 mt-4">Đang tải...</Text>
              </View>
            ) : contracts.length === 0 ? (
              <View className="flex-1 items-center justify-center px-6">
                <Ionicons
                  name="document-text-outline"
                  size={80}
                  color="#D1D5DB"
                />
                <Text className="text-xl font-bold text-gray-800 mt-6">
                  Chưa có hợp đồng
                </Text>
                <Text className="text-gray-600 text-center mt-2">
                  Bạn chưa có hợp đồng thuê xe nào
                </Text>
              </View>
            ) : (
              <ScrollView className="flex-1 p-4">
                {contracts.map((contract: any) => {
                  const getStatusColor = (status: string) => {
                    switch (status?.toLowerCase()) {
                      case "paid":
                        return "bg-green-100";
                      case "pending":
                        return "bg-yellow-100";
                      case "cancelled":
                        return "bg-red-100";
                      default:
                        return "bg-gray-100";
                    }
                  };

                  const getStatusTextColor = (status: string) => {
                    switch (status?.toLowerCase()) {
                      case "paid":
                        return "text-green-700";
                      case "pending":
                        return "text-yellow-700";
                      case "cancelled":
                        return "text-red-700";
                      default:
                        return "text-gray-700";
                    }
                  };

                  const getStatusText = (status: string) => {
                    switch (status?.toLowerCase()) {
                      case "paid":
                        return "Đã thanh toán";
                      case "pending":
                        return "Chờ thanh toán";
                      case "cancelled":
                        return "Đã hủy";
                      default:
                        return status;
                    }
                  };

                  const formatContractDate = (dateString: string) => {
                    const date = new Date(dateString);
                    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
                  };

                  return (
                    <View
                      key={contract.id}
                      className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-4"
                    >
                      {/* Vehicle Info */}
                      <View className="flex-row items-start p-4 border-b border-gray-100">
                        <Image
                          source={{ uri: contract.vehicle?.image }}
                          className="w-20 h-20 rounded-xl bg-gray-100"
                        />
                        <View className="flex-1 ml-3">
                          <Text className="font-bold text-base text-gray-900">
                            {contract.vehicle?.name}
                          </Text>
                          <Text className="text-sm text-gray-600 mt-1">
                            {contract.vehicle?.brand}
                          </Text>
                          <View className="mt-2">
                            <View
                              className={`self-start px-3 py-1 rounded-full ${getStatusColor(contract.status)}`}
                            >
                              <Text
                                className={`text-xs font-semibold ${getStatusTextColor(contract.status)}`}
                              >
                                {getStatusText(contract.status)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      {/* Booking Details */}
                      <View className="p-4 space-y-2">
                        <View className="flex-row items-center mb-2">
                          <Ionicons
                            name="person-outline"
                            size={16}
                            color="#6B7280"
                          />
                          <Text className="text-sm text-gray-700 ml-2">
                            {contract.customer.fullName}
                          </Text>
                        </View>

                        <View className="flex-row items-center mb-2">
                          <Ionicons
                            name="call-outline"
                            size={16}
                            color="#6B7280"
                          />
                          <Text className="text-sm text-gray-700 ml-2">
                            {contract.customer.phone}
                          </Text>
                        </View>

                        <View className="flex-row items-center mb-2">
                          <Ionicons
                            name="calendar-outline"
                            size={16}
                            color="#6B7280"
                          />
                          <Text className="text-sm text-gray-700 ml-2">
                            {formatContractDate(contract.booking?.startDate)} -{" "}
                            {formatContractDate(contract.booking?.endDate)}
                          </Text>
                        </View>

                        {/* Documents Section */}
                        {contract.documents && (
                          <View className="mt-4 pt-4 border-t border-gray-100">
                            <Text className="font-bold text-sm text-gray-900 mb-3">
                              Giấy tờ đã nộp
                            </Text>
                            <View className="flex-row gap-2">
                              {contract.documents.idFrontImage && (
                                <View className="flex-1">
                                  <Text className="text-xs text-gray-600 mb-1">
                                    CCCD mặt trước
                                  </Text>
                                  <Image
                                    source={{
                                      uri: contract.documents.idFrontImage,
                                    }}
                                    className="w-full h-24 rounded-lg bg-gray-100"
                                    resizeMode="cover"
                                  />
                                </View>
                              )}
                              {contract.documents.idBackImage && (
                                <View className="flex-1">
                                  <Text className="text-xs text-gray-600 mb-1">
                                    CCCD mặt sau
                                  </Text>
                                  <Image
                                    source={{
                                      uri: contract.documents.idBackImage,
                                    }}
                                    className="w-full h-24 rounded-lg bg-gray-100"
                                    resizeMode="cover"
                                  />
                                </View>
                              )}
                            </View>
                            {contract.documents.licenseImage && (
                              <View className="mt-2">
                                <Text className="text-xs text-gray-600 mb-1">
                                  Bằng lái xe
                                </Text>
                                <Image
                                  source={{
                                    uri: contract.documents.licenseImage,
                                  }}
                                  className="w-full h-24 rounded-lg bg-gray-100"
                                  resizeMode="cover"
                                />
                              </View>
                            )}
                          </View>
                        )}

                        <View className="flex-row items-center mb-2">
                          <Ionicons
                            name="card-outline"
                            size={16}
                            color="#6B7280"
                          />
                          <Text className="text-sm text-gray-700 ml-2">
                            CCCD: {contract.customer.cccdNumber || "N/A"}
                          </Text>
                        </View>

                        <View className="flex-row items-center mb-2">
                          <Ionicons
                            name="document-outline"
                            size={16}
                            color="#6B7280"
                          />
                          <Text className="text-sm text-gray-700 ml-2">
                            GPLX: {contract.customer.licenseNumber || "N/A"} (
                            {contract.customer.licenseClass || "N/A"})
                          </Text>
                        </View>

                        <View className="flex-row items-center justify-between pt-3 border-t border-gray-100 mt-2">
                          <Text className="text-sm text-gray-600">
                            Tổng tiền
                          </Text>
                          <Text className="text-lg font-bold text-pink-600">
                            {contract.booking?.totalPrice?.toLocaleString()} đ
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

//Components
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
  const [currentMonth, setCurrentMonth] = React.useState(new Date(date));

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0,
  ).getDate();
  const firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1,
  ).getDay();
  const days = Array(firstDay === 0 ? 6 : firstDay - 1)
    .fill(null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  return (
    <View>
      {/* Month/Year Header */}
      <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity
          onPress={goToPreviousMonth}
          className="p-2 rounded-lg bg-gray-100"
        >
          <Ionicons name="chevron-back" size={20} color="#000" />
        </TouchableOpacity>
        <Text className="text-base font-bold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        <TouchableOpacity
          onPress={goToNextMonth}
          className="p-2 rounded-lg bg-gray-100"
        >
          <Ionicons name="chevron-forward" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Calendar */}
      <View className="flex-row flex-wrap">
        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
          <Text
            key={d}
            className="w-[14.2%] text-center text-xs text-gray-400 mb-2"
          >
            {d}
          </Text>
        ))}
        {days.map((day, i) => {
          const isSelected =
            day === selectedDate &&
            currentMonth.getMonth() === date.getMonth() &&
            currentMonth.getFullYear() === date.getFullYear();

          return (
            <TouchableOpacity
              key={i}
              onPress={() => {
                if (day) {
                  const newDate = new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth(),
                    day,
                  );
                  onSelectDay(day);
                }
              }}
              className={`w-[14.2%] h-10 items-center justify-center rounded-lg ${isSelected ? "bg-pink-600" : ""}`}
            >
              <Text
                className={isSelected ? "text-white font-bold" : "text-black"}
              >
                {day || ""}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
