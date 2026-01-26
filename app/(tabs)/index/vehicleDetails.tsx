import { getVehicleById } from "@/lib/firebase/firestore";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text } from "react-native";

export default function VehicleDetails() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [vehicle, setVehicle] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    getVehicleById(id).then(data => {
      setVehicle(data)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />
  }

  if (!vehicle) {
    return <Text>Không tìm thấy xe</Text>
  }

  return (
    <ScrollView style={{ padding: 16 }}>
      {/* IMAGE */}
      <Image
        source={{ uri: vehicle.images?.[0] }}
        style={{ width: "100%", height: 220, borderRadius: 12 }}
        resizeMode="cover"
      />

      {/* NAME */}
      <Text style={{ fontSize: 22, fontWeight: "600", marginTop: 12 }}>
        {vehicle.name}
      </Text>

      {/* PRICE */}
      <Text style={{ fontSize: 18, color: "#E53935", marginVertical: 8 }}>
        {vehicle.pricePerDay.toLocaleString()} đ / ngày
      </Text>

      {/* RATING */}
      <Text>⭐ {vehicle.ratingAvg} ({vehicle.totalReviews} đánh giá)</Text>

      {/* TYPE */}
      <Text style={{ marginTop: 8 }}>
        Loại: {vehicle.type?.join(", ")}
      </Text>

      {/* DESCRIPTION */}
      <Text style={{ marginTop: 12, fontSize: 16 }}>
        {vehicle.description}
      </Text>
    </ScrollView>
  )
}
