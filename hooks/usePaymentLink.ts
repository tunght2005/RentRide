// hooks/usePaymentLink.ts
import { saveContract } from "@/lib/firebase/firestore";

export const usePaymentLink = () => {
  const createPayment = async (contractPayload: {
    user: {
      fullName: string;
      phone: string;
      email: string;
      address: string;
      dob: string;
      cccdNumber: string;
      permanentAddress: string;
      licenseNumber: string;
      licenseClass: string;
    };
    documents: {
      idFrontImage: string;
      idBackImage: string;
      licenseImage: string;
    };
    vehicle: {
      id: string;
      name: string;
      brand: string;
      year: number;
      licensePlate: string;
      image: string;
    };
    booking: {
      startDate: string;
      endDate: string;
      rentalDays: number;
      pricePerDay: number;
      totalPrice: number;
    };
    userId: string;
  }) => {
    // Tạo orderId
    const orderId = `${Date.now()}`;

    // Lưu contract vào Firebase với cấu trúc nested đúng
    const contractData = {
      orderId,
      userId: contractPayload.userId,
      status: "pending",

      customer: {
        fullName: contractPayload.user.fullName,
        phone: contractPayload.user.phone,
        email: contractPayload.user.email,
        address: contractPayload.user.address,
        dob: contractPayload.user.dob,
        cccdNumber: contractPayload.user.cccdNumber,
        permanentAddress: contractPayload.user.permanentAddress,
        licenseNumber: contractPayload.user.licenseNumber,
        licenseClass: contractPayload.user.licenseClass,
      },

      documents: {
        idFrontImage: contractPayload.documents.idFrontImage,
        idBackImage: contractPayload.documents.idBackImage,
        licenseImage: contractPayload.documents.licenseImage,
      },

      vehicle: {
        id: contractPayload.vehicle.id,
        name: contractPayload.vehicle.name,
        brand: contractPayload.vehicle.brand,
        year: contractPayload.vehicle.year,
        licensePlate: contractPayload.vehicle.licensePlate,
        image: contractPayload.vehicle.image,
      },

      booking: {
        startDate: contractPayload.booking.startDate,
        endDate: contractPayload.booking.endDate,
        rentalDays: contractPayload.booking.rentalDays,
        pricePerDay: contractPayload.booking.pricePerDay,
        totalPrice: contractPayload.booking.totalPrice,
      },
    };

    await saveContract(contractPayload.userId, orderId, contractData);

    // Gửi lên Cloud Function để tạo VNPay link
    try {
      const res = await fetch(
        "https://createvnpaypayment-vzdymlhokq-uc.a.run.app",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: contractPayload.booking.totalPrice,
            orderId: orderId,
          }),
        },
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Cloud Function error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();

      if (!data.paymentUrl) {
        throw new Error("No payment url in response");
      }

      return data.paymentUrl;
    } catch (error) {
      console.error("Payment creation error:", error);
      throw error;
    }
  };

  return { createPayment };
};
