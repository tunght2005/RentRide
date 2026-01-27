import cors from "cors";
import * as crypto from "crypto";
import express from "express";
import { onRequest } from "firebase-functions/v2/https";
import * as qs from "qs";

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
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  const date = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const orderId = Date.now().toString();

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
