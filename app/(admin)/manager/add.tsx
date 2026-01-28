import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLayoutEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useNavigation } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { addVehicle } from "../../../lib/firebase/firestore";
import { uploadImageToCloudinary } from "../../../lib/upload";

export default function AddCar() {
  const router = useRouter();
  const navigation = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();

  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [locationId, setLocationId] = useState("hcm");

  // EXTRA FIELDS
  const [transmission, setTransmission] = useState("");
  const [seats, setSeats] = useState("");
  const [fuel, setFuel] = useState("");
  const [year, setYear] = useState("");
  const [plate, setPlate] = useState("");

  // STATUS
  const [status, setStatus] = useState<
    "available" | "renting" | "maintenance"
  >("available");

  const LOCATIONS = [
    { id: "hcm", name: "Hồ Chí Minh" },
    { id: "hn", name: "Hà Nội" },
    { id: "danang", name: "Đà Nẵng" },
    { id: "cantho", name: "Cần Thơ" },
    { id: "vungtau", name: "Vũng Tàu" },
    { id: "haiphong", name: "Hải Phòng" },
    { id: "quangninh", name: "Quảng Ninh" },
    { id: "phuquoc", name: "Phú Quốc" },
    { id: "binhduong", name: "Bình Dương" },
    { id: "vinhthanh", name: "Vĩnh Thạnh" },
    { id: "tiengiang", name: "Tiền Giang" },
    { id: "angiang", name: "An Giang" },
    { id: "kiengiang", name: "Kiên Giang" },
    { id: "baria-vungtau", name: "Bà Rịa - Vũng Tàu" },
    { id: "daklak", name: "Đắk Lắk" },
    { id: "lamdong", name: "Lâm Đồng" },
    { id: "ninhthuan", name: "Ninh Thuận" },
    { id: "binhthuan", name: "Bình Thuận" },
    { id: "quangngai", name: "Quảng Ngãi" },
    { id: "khanhhoa", name: "Khánh Hòa" },
    { id: "phuyen", name: "Phú Yên" },
    { id: "gialai", name: "Gia Lai" },
    { id: "daknong", name: "Đắk Nông" },
    { id: "travinh", name: "Trà Vinh" },
    { id: "vinhlong", name: "Vĩnh Long" },
    { id: "haugiang", name: "Hậu Giang" },
    { id: "camau", name: "Cà Mau" },
    { id: "backan", name: "Bắc Kạn" },
    { id: "bacgiang", name: "Bắc Giang" },
    { id: "langson", name: "Lạng Sơn" },
    { id: "tuyenquang", name: "Tuyên Quang" },
    { id: "yenbai", name: "Yên Bái" },
    { id: "sonla", name: "Sơn La" },
    { id: "hoabinh", name: "Hòa Bình" },
    { id: "thainguyen", name: "Thái Nguyên" },
    { id: "hanam", name: "Hà Nam" },
    { id: "ninhbinh", name: "Ninh Bình" },
    { id: "phutho", name: "Phú Thọ" },
    { id: "thaibinh", name: "Thái Bình" },
  ];

  const [mainImage, setMainImage] = useState<string | null>(null);
  const [subImage, setSubImage] = useState<string | null>(null);

  const pickImage = async (setImage: any) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name || !price || !mainImage || !subImage || !plate) {
      Alert.alert("Lỗi", "Vui lòng nhập đủ thông tin và chọn đủ 2 ảnh");
      return;
    }

    try {
      setLoading(true);

      const mainUrl = await uploadImageToCloudinary(mainImage);
      const subUrl = await uploadImageToCloudinary(subImage);

      await addVehicle({
        name,
        type,
        brand,
        price: Number(price),
        description: desc,
        images: [mainUrl, subUrl],

        isAvailable: true,
        status, // 👈 LƯU STATUS

        locationId,
        transmission,
        seats: Number(seats),
        fuel,
        year: Number(year),
        plate,
      });

      Alert.alert("Thành công", "Đã thêm xe");
      router.back();
    } catch (e: any) {
      Alert.alert("Lỗi", e.message);
    } finally {
      setLoading(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className="mr-4"
        >
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Text className="text-pink-700 font-bold text-base">Lưu</Text>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, loading, name, price, mainImage, subImage, plate, status]);

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="px-4 pt-4"
        contentContainerStyle={{ paddingBottom: tabBarHeight + 40 }}
      >
        {/* BASIC */}
        <Text className="font-bold mb-2">Tên xe *</Text>
        <TextInput
          className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4"
          value={name}
          onChangeText={setName}
        />

        <Text className="font-bold mb-2">Loại xe</Text>
        <TextInput
          className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4"
          value={type}
          onChangeText={setType}
        />

        <Text className="font-bold mb-2">Thương hiệu</Text>
        <TextInput
          className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4"
          value={brand}
          onChangeText={setBrand}
        />

        {/* STATUS */}
        <Text className="font-bold mb-3">Trạng thái xe</Text>
        <View className="flex-row mb-4">
          {[
            { id: "available", label: "Sẵn sàng" },
            { id: "renting", label: "Đang thuê" },
            { id: "maintenance", label: "Bảo trì" },
          ].map((s) => {
            const active = status === s.id;

            return (
              <TouchableOpacity
                key={s.id}
                onPress={() => setStatus(s.id as any)}
                className={`flex-1 mr-2 p-3 rounded-xl border ${
                  active
                    ? "bg-pink-700 border-pink-700"
                    : "bg-white border-gray-300"
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    active ? "text-white" : "text-gray-700"
                  }`}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* PRICE */}
        <Text className="font-bold mb-2">Giá thuê/ngày *</Text>
        <TextInput
          className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        {/* PLATE */}
        <Text className="font-bold mb-2">Biển số *</Text>
        <TextInput
          className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4"
          value={plate}
          onChangeText={setPlate}
        />

        {/* IMAGES */}
        <Text className="font-bold mb-2">Ảnh chính *</Text>
        <TouchableOpacity
          onPress={() => pickImage(setMainImage)}
          className="border border-dashed border-gray-300 bg-white rounded-xl h-36 items-center justify-center"
        >
          {mainImage ? (
            <Image
              source={{ uri: mainImage }}
              className="w-full h-full rounded-xl"
            />
          ) : (
            <UploadUI />
          )}
        </TouchableOpacity>

        <Text className="font-bold mt-4 mb-2">Ảnh phụ *</Text>
        <TouchableOpacity
          onPress={() => pickImage(setSubImage)}
          className="border border-dashed border-gray-300 bg-white rounded-xl h-36 items-center justify-center"
        >
          {subImage ? (
            <Image
              source={{ uri: subImage }}
              className="w-full h-full rounded-xl"
            />
          ) : (
            <UploadUI />
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const UploadUI = () => (
  <View className="items-center">
    <Ionicons name="cloud-upload-outline" size={28} color="#9ca3af" />
    <Text className="text-gray-400 mt-2">Nhấn để tải ảnh</Text>
  </View>
);
