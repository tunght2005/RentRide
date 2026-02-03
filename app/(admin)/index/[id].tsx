import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  getContractByOrderId,
  updateContractStatus,
} from "../../../lib/firebase/firestore";

export default function ContractDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadContract = async () => {
      try {
        const data = await getContractByOrderId(id);
        setContract(data);
      } catch (error) {
        console.error("Error loading contract:", error);
      } finally {
        setLoading(false);
      }
    };

    loadContract();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;

    try {
      setUpdating(true);
      await updateContractStatus(id, newStatus as any);
      setContract({ ...contract, status: newStatus });
      Alert.alert("Thành công", `Đã cập nhật trạng thái thành: ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return {
          bg: "bg-green-100",
          text: "text-green-600",
          label: "Đang thuê",
        };
      case "pending":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-600",
          label: "Chưa thanh toán",
        };
      case "cancelled":
        return { bg: "bg-gray-100", text: "text-gray-600", label: "Huỷ" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-600", label: status };
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Đang tải...</Text>
      </View>
    );
  }

  if (!contract) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Không tìm thấy hợp đồng</Text>
      </View>
    );
  }

  const statusColor = getStatusColor(contract.status);

  return (
    <ScrollView className="flex-1 bg-gray-50 pb-20">
      {/* HEADER */}
      <View className="bg-white px-4 py-4 flex-row items-center justify-between border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-bold">Chi tiết hợp đồng</Text>
        <View className="w-6" />
      </View>

      <View className="px-4 py-4">
        {/* TRẠNG THÁI */}
        <View className={`${statusColor.bg} rounded-2xl p-4 mb-4`}>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className={`${statusColor.text} text-sm font-semibold`}>
                Trạng thái
              </Text>
              <Text className={`${statusColor.text} text-2xl font-bold mt-1`}>
                {statusColor.label}
              </Text>
            </View>
            <Ionicons
              name={
                contract.status === "completed"
                  ? "checkmark-circle"
                  : contract.status === "cancelled"
                    ? "close-circle"
                    : "time"
              }
              size={40}
              color={statusColor.text}
            />
          </View>
        </View>

        {/* XE */}
        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="text-lg font-bold mb-3">Thông tin xe</Text>
          <Image
            source={{
              uri: contract.vehicle?.image || "https://via.placeholder.com/300",
            }}
            className="w-full h-48 rounded-xl mb-3"
            resizeMode="cover"
          />
          <View className="space-y-2">
            <DetailRow label="Tên xe" value={contract.vehicle?.name || "N/A"} />
            <DetailRow
              label="Thương hiệu"
              value={contract.vehicle?.brand || "N/A"}
            />
            <DetailRow label="Năm" value={contract.vehicle?.year || "N/A"} />
            <DetailRow
              label="Biển số"
              value={contract.vehicle?.licensePlate || "N/A"}
            />
          </View>
        </View>

        {/* BOOKING */}
        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="text-lg font-bold mb-3">Thông tin thuê</Text>
          <View className="space-y-3">
            <DetailRow
              label="Ngày bắt đầu"
              value={formatDate(contract.booking?.startDate)}
            />
            <DetailRow
              label="Ngày kết thúc"
              value={formatDate(contract.booking?.endDate)}
            />
            <DetailRow
              label="Số ngày thuê"
              value={`${contract.booking?.rentalDays || 0} ngày`}
            />
            <DetailRow
              label="Giá/ngày"
              value={`${contract.booking?.pricePerDay?.toLocaleString() || 0} đ`}
            />
            <DetailRow
              label="Tổng giá"
              value={`${contract.booking?.totalPrice?.toLocaleString() || 0} đ`}
              highlight
            />
            <DetailRow
              label="Ngày tạo"
              value={formatDate(contract.createdAt)}
            />
          </View>
        </View>

        {/* KHÁCH HÀNG */}
        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="text-lg font-bold mb-3">Thông tin khách hàng</Text>
          <View className="space-y-3">
            <DetailRow
              label="Email"
              value={contract.customer?.email || "N/A"}
            />
            <DetailRow
              label="Địa chỉ"
              value={contract.customer?.address || "N/A"}
            />
            <DetailRow
              label="CCCD"
              value={contract.customer?.cccdNumber || "N/A"}
            />
            <DetailRow
              label="Ngày sinh"
              value={contract.customer?.dob || "N/A"}
            />
          </View>
          <DetailRow
            label="Hạng Bằng"
            value={contract.customer?.licenseClass || "N/A"}
          />
        </View>

        {/* THÔNG TIN KHÁC */}
        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="text-lg font-bold mb-3">Thông tin giấy tờ</Text>
          <View className="space-y-3">
            {/* CCCD Mặt Trước */}
            <View className="mb-3">
              <Text className="text-gray-600 mb-2">CCCD Mặt Trước</Text>
              {contract.documents?.idFrontImage ? (
                <Image
                  source={{ uri: contract.documents.idFrontImage }}
                  className="w-full h-48 rounded-xl"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-gray-400 italic">Chưa có ảnh</Text>
              )}
            </View>

            {/* CCCD Mặt Sau */}
            <View className="mb-3">
              <Text className="text-gray-600 mb-2">CCCD Mặt Sau</Text>
              {contract.documents?.idBackImage ? (
                <Image
                  source={{ uri: contract.documents.idBackImage }}
                  className="w-full h-48 rounded-xl"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-gray-400 italic">Chưa có ảnh</Text>
              )}
            </View>

            {/* GPLX */}
            <View className="mb-3">
              <Text className="text-gray-600 mb-2">GPLX</Text>
              {contract.documents?.licenseImage ? (
                <Image
                  source={{ uri: contract.documents.licenseImage }}
                  className="w-full h-48 rounded-xl"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-gray-400 italic">Chưa có ảnh</Text>
              )}
            </View>
          </View>
        </View>

        {/* CẬP NHẬT TRẠNG THÁI */}
        <View className="bg-white rounded-2xl p-4 mb-6">
          <Text className="text-lg font-bold mb-3">Cập nhật trạng thái</Text>
          <View className="gap-2">
            {["pending", "paid", "cancelled"].map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => handleStatusChange(status)}
                disabled={updating || contract.status === status}
                className={`p-3 rounded-lg flex-row items-center ${
                  contract.status === status
                    ? "bg-gray-200"
                    : "bg-gray-100 border border-gray-300"
                }`}
              >
                <View
                  className={`w-4 h-4 rounded-full mr-3 ${
                    contract.status === status ? "bg-blue-500" : "bg-gray-400"
                  }`}
                />
                <Text
                  className={`font-semibold ${
                    contract.status === status
                      ? "text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  {getStatusColor(status).label}
                </Text>
                {updating && contract.status === status && (
                  <Ionicons
                    name="hourglass"
                    size={16}
                    color="gray"
                    style={{ marginLeft: "auto" }}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="h-6" />
      </View>
    </ScrollView>
  );
}

/*  COMPONENT  */

function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
      <Text className="text-gray-600">{label}</Text>
      <Text
        className={`font-semibold text-right flex-1 ml-2 ${
          highlight ? "text-pink-600 text-lg" : "text-gray-900"
        }`}
      >
        {value}
      </Text>
    </View>
  );
}
