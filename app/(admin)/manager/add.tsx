import { View, Text, TextInput, ScrollView, TouchableOpacity, Image } from "react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { addVehicle } from "@/lib/firebase/firestore";
import { useRouter } from "expo-router";

export default function AddCar() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const [mainImage, setMainImage] = useState<string | null>(null);
  const [subImage, setSubImage] = useState<string | null>(null);

  const pickImage = async (setImage: any) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name || !type || !brand || !price || !mainImage) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setLoading(true);

      await addVehicle({
        name,
        type,
        brand,
        price: Number(price),
        description: desc,
        mainImage,
        subImages: subImage ? [subImage] : [],
        locationId: "HCM",
        isAvailable: true,
      });

      alert("Đã thêm xe thành công 🚗");
      router.back();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu xe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50 px-4"
      contentContainerStyle={{ paddingBottom: 160 }}   // fix tabbar
    >

      <Text className="font-bold mb-1">Tên xe *</Text>
      <TextInput
        className="bg-white border border-gray-200 rounded-xl p-3 mb-4"
        placeholder="VD: Toyota Vios 2023"
        value={name}
        onChangeText={setName}
      />

      <Text className="font-bold mb-1">Loại xe *</Text>
      <TextInput
        className="bg-white border border-gray-200 rounded-xl p-3 mb-4"
        placeholder="Ô tô, Xe máy..."
        value={type}
        onChangeText={setType}
      />

      <Text className="font-bold mb-1">Thương hiệu *</Text>
      <TextInput
        className="bg-white border border-gray-200 rounded-xl p-3 mb-4"
        placeholder="Toyota, Honda..."
        value={brand}
        onChangeText={setBrand}
      />

      <Text className="font-bold mb-1">Giá thuê/ngày *</Text>
      <TextInput
        className="bg-white border border-gray-200 rounded-xl p-3 mb-4"
        placeholder="800000"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />

      <Text className="font-bold mb-1">Mô tả</Text>
      <TextInput
        className="bg-white border border-gray-200 rounded-xl p-3 mb-4 h-24"
        multiline
        placeholder="Mô tả chi tiết..."
        value={desc}
        onChangeText={setDesc}
      />

      <Text className="font-bold mb-2">Ảnh chính *</Text>
      <TouchableOpacity
        onPress={() => pickImage(setMainImage)}
        className="h-36 border border-dashed border-gray-300 rounded-xl justify-center items-center bg-white mb-4"
      >
        {mainImage ? (
          <Image source={{ uri: mainImage }} className="w-full h-full rounded-xl" />
        ) : (
          <UploadUI />
        )}
      </TouchableOpacity>

      <Text className="font-bold mb-2">Ảnh phụ</Text>
      <TouchableOpacity
        onPress={() => pickImage(setSubImage)}
        className="h-36 border border-dashed border-gray-300 rounded-xl justify-center items-center bg-white"
      >
        {subImage ? (
          <Image source={{ uri: subImage }} className="w-full h-full rounded-xl" />
        ) : (
          <UploadUI />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSave}
        disabled={loading}
        className={`mt-8 py-4 rounded-xl items-center ${loading ? "bg-gray-400" : "bg-pink-700"}`}
      >
        <Text className="text-white font-bold text-lg">
          {loading ? "Đang lưu..." : "Lưu xe"}
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const UploadUI = () => (
  <View className="items-center">
    <Ionicons name="cloud-upload-outline" size={30} color="#888" />
    <Text className="text-gray-400 mt-1">Nhấn để tải ảnh</Text>
  </View>
);
