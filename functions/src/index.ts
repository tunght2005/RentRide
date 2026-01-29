import cors from "cors";
import * as crypto from "crypto";
import express from "express";
import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/v2/https";
import * as qs from "qs";

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const vnpConfig = {
  tmnCode: process.env.VNPAY_TMN_CODE!,
  hashSecret: process.env.VNPAY_HASH_SECRET!,
  returnUrl: process.env.VNPAY_RETURN_URL!,
  url: process.env.VNPAY_URL!,
};

app.post("/", (req, res) => {
  const amount = Number(req.body.amount);
  const orderId = req.body.orderId;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  if (!orderId) {
    return res.status(400).json({ message: "Invalid orderId" });
  }

  const date = new Date(Date.now() + 7 * 60 * 60 * 1000);

  const vnpParams: Record<string, any> = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: vnpConfig.tmnCode,
    vnp_Amount: amount * 100,
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: "Thanh toan RentRide",
    vnp_OrderType: "other",
    vnp_Locale: "vn",
    vnp_ReturnUrl: vnpConfig.returnUrl,
    vnp_IpAddr: "127.0.0.1",
    vnp_CreateDate: formatDate(date),
  };

  const sortedParams = Object.keys(vnpParams)
    .sort()
    .reduce((r: any, k) => ((r[k] = vnpParams[k]), r), {});

  const signData = qs.stringify(sortedParams, {
    encode: true,
    format: "RFC1738",
  });

  const secureHash = crypto
    .createHmac("sha512", vnpConfig.hashSecret)
    .update(signData)
    .digest("hex");

  sortedParams.vnp_SecureHashType = "HmacSHA512";
  sortedParams.vnp_SecureHash = secureHash;

  const paymentUrl =
    vnpConfig.url + "?" + qs.stringify(sortedParams, { encode: true });

  return res.json({ paymentUrl });
});

// Update contract status endpoint
app.post("/updateContractStatus", async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ message: "Missing orderId or status" });
    }

    const contractRef = db.collection("contracts").doc(orderId);
    const contractSnap = await contractRef.get();

    if (!contractSnap.exists) {
      return res.status(404).json({ message: "Contract not found" });
    }

    // Update contract status
    await contractRef.update({
      status,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res.json({ success: true, message: "Contract status updated" });
  } catch (error) {
    console.error("Error updating contract:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
});

export const createVNPayPayment = onRequest(app);

function formatDate(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}
