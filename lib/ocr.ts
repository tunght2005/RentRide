import axios from "axios";

// FPT.AI Vision API key
const FPT_AI_API_KEY = process.env.EXPO_PUBLIC_FPT_AI_API_KEY;

type DocumentType = "idFront" | "idBack" | "license";

/**
 * Get correct FPT endpoint by document type
 */
const getEndpointByType = (type: DocumentType) => {
  if (type === "license") {
    // ✅ Driver License
    return "https://api.fpt.ai/vision/dlr/vnm";
  }
  // ✅ ID Card (CCCD / CMND)
  return "https://api.fpt.ai/vision/idr/vnm";
};

/**
 * Call FPT.AI Vision API to extract text from document image
 */
export const extractDataFromFPTAI = async (
  imageBase64: string,
  documentType: DocumentType,
) => {
  if (!FPT_AI_API_KEY) {
    throw new Error("FPT.AI API key not configured");
  }

  // convert base64 → Blob
  const byteCharacters = atob(imageBase64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "image/jpeg" });

  const formData = new FormData();
  formData.append("image", blob, "document.jpg");

  const endpoint = getEndpointByType(documentType);

  const response = await axios.post(endpoint, formData, {
    headers: {
      "api-key": FPT_AI_API_KEY,
      "Content-Type": "multipart/form-data",
    },
  });

  if (response.data.errorCode !== 0) {
    throw new Error(response.data.errorMessage || "FPT OCR failed");
  }

  const data = response.data.data?.[0] || {};

  // ===== Mapping theo loại giấy tờ =====
  if (documentType === "idFront") {
    return {
      fullName: data.name || "",
      cccdNumber: data.id || "",
      dob: data.dob || "",
      permanentAddress: data.address || "",
    };
  }

  if (documentType === "idBack") {
    return {
      cccdNumber: data.id || "",
    };
  }

  // Driver License
  return {
    licenseNumber: data.id || "",
    licenseClass: data.class || "",
  };
};

/**
 * Convert image URI (web / mobile) → base64
 * Expo SDK 54+ SAFE
 */
export const convertImageToBase64 = async (
  imageUri: string,
): Promise<string> => {
  const response = await fetch(imageUri);
  const blob = await response.blob();

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result?.toString().split(",")[1];
      if (!base64) reject(new Error("Base64 conversion failed"));
      else resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
