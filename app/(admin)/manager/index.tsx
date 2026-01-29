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

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../lib/firebase/firestore";

export default function Manager() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight(); // 👈 chiều cao bottom tab

  const [allCars, setAllCars] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // REALTIME FIREBASE
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

  // 🗑 XOÁ XE
  const handleDelete = (id: string) => {
    Alert.alert("Xoá xe", "Bạn có chắc muốn xoá xe này?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "vehicles", id));
        },
      },
    ]);
  };

  // 🔍 TÌM KIẾM
  const handleSearch = (text: string) => {
    setSearch(text);

    if (text === "") {
      setCars(allCars);
    } else {
      const q = text.toLowerCase();
      const filtered = allCars.filter((car) =>
        car.name?.toLowerCase().includes(q)
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
          paddingBottom: tabBarHeight + 24, // 👈 chừa chỗ cho bottom bar
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
                className="bg-red-100 p-2 rounded-xl"
              >
                <Ionicons name="trash" size={18} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}
