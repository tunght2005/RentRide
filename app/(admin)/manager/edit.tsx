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
import { useEffect, useLayoutEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { getDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../lib/firebase/firestore";
import { uploadImageToCloudinary } from "../../../lib/upload";

export default function EditCar() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [locationId, setLocationId] = useState("hcm");

  const [transmission, setTransmission] = useState("");
  const [seats, setSeats] = useState("");
  const [fuel, setFuel] = useState("");
  const [year, setYear] = useState("");
  const [plate, setPlate] = useState("");

  const [mainImage, setMainImage] = useState<string | null>(null);
  const [subImage, setSubImage] = useState<string | null>(null);

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

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "vehicles", id));
        if (!snap.exists()) {
          Alert.alert("Lỗi", "Không tìm thấy xe");
          router.back();
          return;
        }

        const data: any = snap.data();

        setName(data.name || "");
        setType(data.type || "");
        setBrand(data.brand || "");
        setPrice(String(data.price || ""));
        setDesc(data.description || "");
        setLocationId(data.locationId || "hcm");

        setTransmission(data.transmission || "");
        setSeats(data.seats ? String(data.seats) : "");
        setFuel(data.fuel || "");
        setYear(data.year ? String(data.year) : "");
        setPlate(data.plate || "");

        setStatus(data.status || "available");

        if (data.images?.length > 0) setMainImage(data.images[0]);
        if (data.images?.length > 1) setSubImage(data.images[1]);
      } finally {
        setLoadingData(false);
      }
    };

    load();
  }, []);

  const pickImage = async (setImage: (v: string) => void) => {
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
    if (!name || !price || !mainImage || !plate) {
      Alert.alert("Lỗi", "Thiếu dữ liệu bắt buộc");
      return;
    }

    try {
      setLoading(true);

      let mainUrl = mainImage;
      let subUrl = subImage;

      if (mainImage.startsWith("file")) {
        mainUrl = await uploadImageToCloudinary(mainImage);
      }

      if (subImage && subImage.startsWith("file")) {
        subUrl = await uploadImageToCloudinary(subImage);
      }

      await updateDoc(doc(db, "vehicles", id), {
        name,
        type,
        brand,
        price: Number(price),
        description: desc,
        locationId,
        transmission,
        seats: seats ? Number(seats) : null,
        fuel,
        year: year ? Number(year) : null,
        plate,
        status, // 👈 status được lưu
        images: subUrl ? [mainUrl, subUrl] : [mainUrl],
        updatedAt: serverTimestamp(),
      });

      Alert.alert("Thành công", "Đã cập nhật xe");
      router.back();
    } catch (e: any) {
      Alert.alert("Lỗi", e.message || "Không thể cập nhật");
    } finally {
      setLoading(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} disabled={loading} className="mr-4">
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Text className="text-pink-700 font-bold">Lưu</Text>
          )}
        </TouchableOpacity>
      ),
    });
  }, [loading, name, price, mainImage, plate, locationId, status]);

  if (loadingData) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="px-4 pt-4"
        contentContainerStyle={{ paddingBottom: tabBarHeight + 40 }}
      >
        <Text className="font-bold mb-2">Tên xe *</Text>
        <TextInput className="bg-white border rounded-xl px-4 py-3 mb-4" value={name} onChangeText={setName} />

        <Text className="font-bold mb-2">Loại xe</Text>
        <TextInput className="bg-white border rounded-xl px-4 py-3 mb-4" value={type} onChangeText={setType} />

        <Text className="font-bold mb-2">Thương hiệu</Text>
        <TextInput className="bg-white border rounded-xl px-4 py-3 mb-4" value={brand} onChangeText={setBrand} />

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

        {/* Các field khác giữ nguyên */}
        <Text className="font-bold mb-2">Biển số</Text>
        <TextInput className="bg-white border rounded-xl px-4 py-3 mb-4" value={plate} onChangeText={setPlate} />

        <Text className="font-bold mb-2">Giá</Text>
        <TextInput keyboardType="numeric" className="bg-white border rounded-xl px-4 py-3 mb-4" value={price} onChangeText={setPrice} />

        <Text className="font-bold mb-2">Ảnh chính</Text>
        <TouchableOpacity onPress={() => pickImage(setMainImage)} className="border border-dashed rounded-xl h-36 bg-white justify-center items-center">
          {mainImage ? <Image source={{ uri: mainImage }} className="w-full h-full rounded-xl" /> : <UploadUI />}
        </TouchableOpacity>

        <Text className="font-bold mt-4 mb-2">Ảnh phụ</Text>
        <TouchableOpacity onPress={() => pickImage(setSubImage)} className="border border-dashed rounded-xl h-36 bg-white justify-center items-center">
          {subImage ? <Image source={{ uri: subImage }} className="w-full h-full rounded-xl" /> : <UploadUI />}
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
