import { useBookings } from "@/hooks/useBookings";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";

export default function BookingHome() {
  const userId = "USER_ID_HIEN_TAI"; // lấy từ auth

  const {
    bookings,
    loading,
    formatDate,
    formatCurrency,
    getStatusText,
    getStatusStyle,
  } = useBookings(userId);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-lg font-semibold mb-4">Lịch sử đặt xe</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {bookings.map((item) => {
          const status = item.status?.[0] || "pending";

          return (
            <View
              key={item.id}
              className="border border-gray-200 rounded-xl mb-4 p-3"
            >
              <View className="flex-row items-center">
                <Image
                  source={{
                    uri:
                      item.images?.[0]?.url ||
                      "https://via.placeholder.com/150",
                  }}
                  className="w-14 h-14 rounded-lg mr-3"
                />

                <View className="flex-1">
                  <Text className="font-semibold">
                    Xe: {item.vehicleId || "---"}
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    {formatDate(item.startDate)} - {formatDate(item.endDate)}
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    {item.totalDays} ngày
                  </Text>
                </View>

                <View
                  className={`px-3 py-1 rounded-full ${getStatusStyle(status)}`}
                >
                  <Text className="text-xs font-medium">
                    {getStatusText(status)}
                  </Text>
                </View>
              </View>

              <View className="h-px bg-gray-200 my-3" />

              <View className="flex-row justify-between">
                <Text className="text-gray-500">Tổng tiền</Text>
                <Text className="text-red-600 font-semibold">
                  {formatCurrency(item.totalPrice)}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
