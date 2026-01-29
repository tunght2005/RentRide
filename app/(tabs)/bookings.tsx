import { useBookings } from "@/hooks/useBookings";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function BookingsScreen() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUserId(user.uid);
      else setCurrentUserId(null);
      setInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  const {
    bookings,
    loading,
    error,
    formatCurrency,
    formatDate,
    getStatusStyles,
    refetch,
  } = useBookings(currentUserId || undefined);

  const onRefresh = async () => {
    setRefreshing(true);
    if (refetch) await refetch();
    setRefreshing(false);
  };

  if (initializing || (loading && !refreshing && !bookings.length)) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!currentUserId) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text>Vui lòng đăng nhập để xem lịch sử.</Text>
      </View>
    );
  }

  const modalStatusStyle = selectedBooking
    ? getStatusStyles(selectedBooking.status)
    : null;

  return (
    <View className="flex-1 bg-white pt-12 px-4 pb-4">
      <FlatList
        ListHeaderComponent={
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Lịch sử đặt xe
          </Text>
        }
        data={bookings}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Text className="text-gray-400 text-lg">
              Bạn chưa có chuyến đi nào.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const statusStyle = getStatusStyles(item.status);
          const vehicle = item.vehicle || {};
          const booking = item.booking || {};

          return (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setSelectedBooking(item)}
            >
              <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100 shadow-sm shadow-gray-200">
                <View className="flex-row">
                  <Image
                    source={{
                      uri: vehicle.image || "https://via.placeholder.com/150",
                    }}
                    className="w-24 h-20 rounded-lg bg-gray-200"
                    resizeMode="cover"
                  />
                  <View className="flex-1 ml-3 justify-between">
                    <View className="flex-row justify-between items-start">
                      <Text
                        className="text-base font-bold text-gray-900 flex-1 mr-2"
                        numberOfLines={1}
                      >
                        {vehicle.name || "Tên xe ẩn"}
                      </Text>

                      <View
                        className={`px-2 py-1 rounded-full ${statusStyle.container}`}
                      >
                        <Text
                          className={`text-[10px] font-medium ${statusStyle.text}`}
                        >
                          {statusStyle.label}
                        </Text>
                      </View>
                    </View>
                    <View>
                      <Text className="text-xs text-gray-500 mt-1">
                        {formatDate(booking.startDate)} -{" "}
                        {formatDate(booking.endDate)}
                      </Text>
                      <Text className="text-xs text-gray-400 mt-0.5">
                        {booking.rentalDays} ngày
                      </Text>
                    </View>
                  </View>
                </View>
                <View className="h-[1px] bg-gray-100 my-3" />
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-500">Tổng tiền</Text>
                  <Text className="text-base font-bold text-red-600">
                    {formatCurrency(booking.totalPrice || 0)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={!!selectedBooking}
        onRequestClose={() => setSelectedBooking(null)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl items-center">
            <Image
              source={{
                uri:
                  selectedBooking?.vehicle?.image ||
                  "https://via.placeholder.com/300",
              }}
              className="w-full h-48 rounded-xl bg-gray-100 mb-4"
              resizeMode="cover"
            />

            <Text className="text-xl font-bold text-gray-900 text-center mb-2">
              {selectedBooking?.vehicle?.name || "Chi tiết xe"}
            </Text>

            <View className="w-full bg-gray-50 p-3 rounded-lg mb-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500 text-sm">Ngày nhận:</Text>
                <Text className="text-gray-800 font-medium text-sm">
                  {formatDate(selectedBooking?.booking?.startDate)}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500 text-sm">Ngày trả:</Text>
                <Text className="text-gray-800 font-medium text-sm">
                  {formatDate(selectedBooking?.booking?.endDate)}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500 text-sm">Tổng ngày:</Text>
                <Text className="text-gray-800 font-medium text-sm">
                  {selectedBooking?.booking?.rentalDays} ngày
                </Text>
              </View>
            </View>

            {modalStatusStyle && (
              <View className="w-full flex-row justify-between items-center mb-6 px-1">
                <View
                  className={`px-3 py-1.5 rounded-full ${modalStatusStyle.container}`}
                >
                  <Text
                    className={`text-sm font-bold ${modalStatusStyle.text}`}
                  >
                    {modalStatusStyle.label}
                  </Text>
                </View>
                <Text className="text-xl font-bold text-red-600">
                  {formatCurrency(selectedBooking?.booking?.totalPrice)}
                </Text>
              </View>
            )}

            <TouchableOpacity
              className="bg-black w-full py-3 rounded-xl items-center"
              onPress={() => setSelectedBooking(null)}
            >
              <Text className="text-white font-bold text-base">Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
