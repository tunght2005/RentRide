import { useEffect, useState } from "react";
import { getBookingsByUser } from "../lib/firebase/firestore";

export function useBookings(userId: string) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const data = await getBookingsByUser(userId);
        setBookings(data);
      } catch (error) {
        console.error("Fetch bookings error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    return timestamp.toDate().toLocaleDateString("vi-VN");
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString("vi-VN") + " đ";

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "paid":
        return "Đã thanh toán";
      default:
        return "Chờ xử lý";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-600";
      case "paid":
        return "bg-blue-100 text-blue-600";
      default:
        return "bg-yellow-100 text-yellow-600";
    }
  };

  return {
    bookings,
    loading,
    formatDate,
    formatCurrency,
    getStatusText,
    getStatusStyle,
  };
}
