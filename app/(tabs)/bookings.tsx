import { useRouter } from "expo-router"; // 1. Import router
import React from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

// 1. Định nghĩa kiểu dữ liệu (TypeScript)
interface BookingItem {
  id: number;
  vehicleName: string;
  startDate: string;
  endDate: string;
  duration: string;
  status: string;
  price: string;
  image: string;
}

// 2. Dữ liệu mẫu (Mock Data)
const bookingHistoryData: BookingItem[] = [
  {
    id: 1,
    vehicleName: "Toyota Vios 2023",
    startDate: "20/01/2024",
    endDate: "23/01/2024",
    duration: "3 ngày",
    status: "Hoàn thành",
    price: "2.400.000 ₫",
    image:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 2,
    vehicleName: "Honda SH 150i",
    startDate: "01/02/2024",
    endDate: "05/02/2024",
    duration: "4 ngày",
    status: "Đã thanh toán",
    price: "1.000.000 ₫",
    image:
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 3,
    vehicleName: "Hyundai Tucson 2023",
    startDate: "10/02/2024",
    endDate: "12/02/2024",
    duration: "2 ngày",
    status: "Chờ xử lý",
    price: "2.400.000 ₫",
    image:
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 4,
    vehicleName: "Honda PCX 160",
    startDate: "05/03/2024",
    endDate: "07/03/2024",
    duration: "2 ngày",
    status: "Chờ xử lý",
    price: "520.000 ₫",
    image:
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=200&auto=format&fit=crop",
  },
];

// 3. Component con: Badge hiển thị trạng thái
const StatusBadge = ({ status }: { status: string }) => {
  let containerStyle = "";
  let textStyle = "";

  switch (status) {
    case "Hoàn thành":
      containerStyle = "bg-green-100";
      textStyle = "text-green-600";
      break;
    case "Đã thanh toán":
      containerStyle = "bg-blue-100";
      textStyle = "text-blue-600";
      break;
    case "Chờ xử lý":
      containerStyle = "bg-orange-100";
      textStyle = "text-orange-600";
      break;
    default:
      containerStyle = "bg-gray-100";
      textStyle = "text-gray-600";
  }

  return (
    <View className={`px-2 py-1 rounded-full self-start ${containerStyle}`}>
      <Text className={`text-xs font-medium ${textStyle}`}>{status}</Text>
    </View>
  );
};

// 4. Component con: Từng item trong danh sách
const BookingCard = ({ item }: { item: BookingItem }) => (
  <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100 shadow-sm">
    <View className="flex-row">
      <Image
        source={{ uri: item.image }}
        className="w-20 h-20 rounded-lg bg-gray-200"
        resizeMode="cover"
      />
      <View className="flex-1 ml-3 justify-between">
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-2">
            <Text
              className="text-base font-bold text-gray-800"
              numberOfLines={1}
            >
              {item.vehicleName}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">
              {item.startDate} - {item.endDate}
            </Text>
            <Text className="text-xs text-gray-500 mt-0.5">
              {item.duration}
            </Text>
          </View>
          <StatusBadge status={item.status} />
        </View>
      </View>
    </View>

    <View className="h-[1px] bg-gray-100 my-3" />

    <View className="flex-row justify-between items-center bg-gray-50 p-2 rounded-lg">
      <Text className="text-sm text-gray-500">Tổng tiền</Text>
      <Text className="text-lg font-bold text-red-800">{item.price}</Text>
    </View>
  </View>
);

// 5. Component Chính
export default function BookingsScreen() {
  const router = useRouter(); // 2. Khởi tạo router

  // Giả lập user (nếu chưa có context)
  const user = {
    avatar: null, // Để null để test trường hợp fallback ảnh mặc định
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header đã sửa: Dùng flex-row để căn ngang */}
      <View className="flex-row justify-between items-center p-4 bg-white border-b border-gray-100 pt-12">
        {/* pt-12 để tránh tai thỏ (notch) trên iPhone nếu không dùng SafeAreaView */}

        <Text className="text-xl font-bold text-gray-800">Lịch sử đặt xe</Text>

        <TouchableOpacity
          onPress={() => router.push("/profile")} // 3. Điều hướng
          className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border border-gray-200"
        >
          <Image
            source={{
              uri:
                user?.avatar ||
                "https://ui-avatars.com/api/?name=User&background=random",
            }}
            className="w-full h-full"
          />
        </TouchableOpacity>
      </View>

      {/* Danh sách cuộn */}
      <FlatList
        data={bookingHistoryData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <BookingCard item={item} />}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
