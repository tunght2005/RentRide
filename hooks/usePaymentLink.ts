// hooks/usePaymentLink.ts

export const usePaymentLink = () => {
  const createPayment = async ({
    amount,
    orderId,
  }: {
    amount: number;
    orderId: string;
  }) => {
    const res = await fetch(
      "https://createvnpaypayment-vzdymlhokq-uc.a.run.app",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, orderId }),
      },
    );

    const data = await res.json();

    if (!data.paymentUrl) {
      throw new Error("No payment url");
    }

    return data.paymentUrl;
  };

  return { createPayment };
};
