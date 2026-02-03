import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db, deleteVehicle } from "../../../lib/firebase/firestore";

export default function Manager() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();

  const [allCars, setAllCars] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    visible: boolean;
    id: string;
  }>({
    visible: false,
    id: "",
  });

  useEffect(() => {
    const q = query(collection(db, "vehicles"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAllCars(data);
      setCars(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // XOÁ XE
  const handleDelete = (id: string) => {
    setConfirmDelete({ visible: true, id });
  };

  const confirmDeleteVehicle = async () => {
    const id = confirmDelete.id;
    try {
      setDeleting(true);
      const result = await deleteVehicle(id);
      console.log("Delete result:", result);
      setConfirmDelete({ visible: false, id: "" });
    } catch (error: any) {
      console.error("Delete error:", error);
      console.error("Error message:", error.message);
      Alert.alert(
        " Lỗi",
        error.message || "Không thể xoá xe. Kiểm tra quyền admin.",
      );
    } finally {
      setDeleting(false);
    }
  };

  // TÌM KIẾM
  const handleSearch = (text: string) => {
    setSearch(text);

    if (text === "") {
      setCars(allCars);
    } else {
      const q = text.toLowerCase();
      const filtered = allCars.filter((car) =>
        car.name?.toLowerCase().includes(q),
      );
      setCars(filtered);
    }
  };

  return (
    <View className="flex-1 bg-gray-50 px-4">
      {/* HEADER */}
      <View className="flex-row justify-between items-center my-4">
        <Text className="text-2xl font-bold">Quản lý xe</Text>

        <TouchableOpacity
          onPress={() => router.push("/manager/add")}
          className="bg-pink-700 w-10 h-10 rounded-full items-center justify-center"
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* SEARCH */}
      <View className="flex-row bg-white rounded-xl px-3 py-3 mb-4 items-center">
        <Ionicons name="search" size={20} color="#777" />
        <TextInput
          placeholder="Tìm kiếm xe..."
          className="ml-2 flex-1"
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {loading && (
        <Text className="text-center text-gray-500">Đang tải...</Text>
      )}

      <FlatList
        data={cars}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: tabBarHeight + 24,
        }}
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl p-3 flex-row items-center mb-4">
            <Image
              source={{ uri: item.images?.[0] }}
              className="w-16 h-16 rounded-xl"
              resizeMode="cover"
            />

            <View className="flex-1 ml-3">
              <Text className="font-bold">{item.name}</Text>
              <Text className="text-gray-500">{item.brand}</Text>
              <Text className="text-pink-700 font-bold">
                {Number(item.price).toLocaleString()} đ/ngày
              </Text>
            </View>

            <View className="justify-between h-16">
              <TouchableOpacity
                onPress={() => router.push(`/manager/edit?id=${item.id}`)}
                className="bg-gray-100 p-2 rounded-xl"
              >
                <Ionicons name="create-outline" size={18} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                disabled={deleting}
                className={`p-2 rounded-xl ${
                  deleting ? "bg-gray-200" : "bg-red-100"
                }`}
              >
                <Ionicons
                  name="trash"
                  size={18}
                  color={deleting ? "#ccc" : "red"}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* CONFIRM DELETE MODAL */}
      {confirmDelete.visible && (
        <View className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <View className="bg-white rounded-2xl p-6 w-80">
            <Text className="text-lg font-bold mb-4">Xoá xe</Text>
            <Text className="text-gray-600 mb-6">
              Bạn có chắc muốn xoá xe này?
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  console.warn("⏹️ Người dùng nhấn Huỷ");
                  setConfirmDelete({ visible: false, id: "" });
                }}
                className="flex-1 bg-gray-200 py-3 rounded-lg"
              >
                <Text className="text-center font-semibold">Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDeleteVehicle}
                disabled={deleting}
                className={`flex-1 py-3 rounded-lg ${
                  deleting ? "bg-gray-300" : "bg-red-500"
                }`}
              >
                <Text className="text-center font-semibold text-white">
                  {deleting ? "Đang xoá..." : "Xoá"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
