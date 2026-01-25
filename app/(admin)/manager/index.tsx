import { View, Text, FlatList, Image, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const cars = [
  {
    id: "1",
    name: "Mazda 3 Sport",
    brand: "Mazda",
    price: "950.000 đ/ngày",
    image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2",
  },
  {
    id: "2",
    name: "Mercedes C200 AMG",
    brand: "Mercedes-Benz",
    price: "2.500.000 đ/ngày",
    image: "https://images.unsplash.com/photo-1617814075536-8a0a6c584108",
  },
  {
    id: "3",
    name: "Lexus ES250",
    brand: "Lexus",
    price: "2.800.000 đ/ngày",
    image: "https://images.unsplash.com/photo-1606611013016-b3a24f4c2a38",
  },
  {
    id: "4",
    name: "Honda SH 150i",
    brand: "Honda",
    price: "250.000 đ/ngày",
    image: "https://images.unsplash.com/photo-1542362567-b07e54358753",
  },
];

export default function Manager() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-50 p-4">

      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold">Quản lý xe</Text>

        <TouchableOpacity
          onPress={() => router.push("/manager/add")}
          className="bg-pink-700 w-10 h-10 rounded-full items-center justify-center"
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="flex-row items-center bg-white rounded-xl p-3 mb-4 border border-gray-200">
        <Ionicons name="search" size={20} color="#777" />
        <TextInput
          placeholder="Tìm kiếm xe..."
          className="ml-2 flex-1"
        />
      </View>

      {/* List */}
      <FlatList
        data={cars}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/manager/info?id=${item.id}`)}
            className="bg-white rounded-2xl p-3 flex-row items-center mb-4 border border-gray-100"
          >
            <Image
              source={{ uri: item.image }}
              className="w-[70px] h-[70px] rounded-xl"
            />

            <View className="flex-1 ml-3">
              <Text className="font-bold text-base">{item.name}</Text>
              <Text className="text-gray-500">{item.brand}</Text>
              <Text className="text-pink-700 font-bold">{item.price}</Text>
            </View>

            <View className="justify-between h-[60px]">
              <TouchableOpacity
                onPress={() => router.push(`/manager/edit?id=${item.id}`)}
                className="bg-slate-100 p-2 rounded-xl"
              >
                <Ionicons name="create-outline" size={18} />
              </TouchableOpacity>

              <TouchableOpacity className="bg-red-100 p-2 rounded-xl">
                <Ionicons name="trash" size={18} color="red" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
