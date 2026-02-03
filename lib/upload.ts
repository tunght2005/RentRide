import { Platform } from "react-native";

export async function uploadImageToCloudinary(uri: string): Promise<string> {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD!;
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_PRESET!;

  if (!cloudName || !uploadPreset) {
    throw new Error("Thiếu Cloudinary env");
  }

  const formData = new FormData();

  if (Platform.OS === "web") {
    // WEB: fetch blob từ blob:url
    const response = await fetch(uri);
    const blob = await response.blob();

    formData.append("file", blob, "avatar.jpg");
  } else {
    // MOBILE: dùng uri trực tiếp
    formData.append("file", {
      uri,
      name: "avatar.jpg",
      type: "image/jpeg",
    } as any);
  }
  console.log("CLOUD:", cloudName);
  console.log("PRESET:", uploadPreset);

  formData.append("upload_preset", uploadPreset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error("Upload ảnh thất bại: " + text);
  }

  const data = await res.json();
  return data.secure_url as string;
}
