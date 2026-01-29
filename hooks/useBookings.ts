import { getUserBookings } from "@/lib/firebase/firestore";
import { useCallback, useEffect, useState } from "react";

export function useBookings(userId: string | undefined) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getUserBookings(userId);

      const sortedData = data.sort((a: any, b: any) => {
        const timeA = a.booking?.startDate?.toMillis
          ? a.booking.startDate.toMillis()
          : 0;
        const timeB = b.booking?.startDate?.toMillis
          ? b.booking.startDate.toMillis()
          : 0;
        return timeB - timeA;
      });

      setBookings(sortedData);
    } catch (err) {
      console.error("Lỗi fetch booking:", err);
      setError("Không thể tải lịch sử hợp đồng.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // 2. Các hàm tiện ích (Helpers)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const getStatusStyles = (status: string) => {
    const normalizedStatus = status ? status.toLowerCase() : "";

    switch (normalizedStatus) {
      case "completed":
      case "paid":
        return {
          container: "bg-green-100",
          text: "text-green-700",
          label: "Đã được thuê",
        };
      case "pending":
        return {
          container: "bg-yellow-100",
          text: "text-yellow-800",
          label: "Chờ xử lý",
        };
      case "cancelled":
        return {
          container: "bg-red-100",
          text: "text-red-700",
          label: "Đã hủy",
        };
      default:
        return {
          container: "bg-gray-100",
          text: "text-gray-700",
          label: status,
        };
    }
  };

  return {
    bookings,
    loading,
    error,
    formatCurrency,
    formatDate,
    getStatusStyles,
    refetch: fetchBookings,
  };
}
