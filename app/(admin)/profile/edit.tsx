import { View, Text, Image, TouchableOpacity } from "react-native";
import { useState } from "react";
import { router } from "expo-router";

import { Input } from "../../../components/common/Input";
import { Button } from "../../../components/common/Button";
import { useAuth } from "../../../hooks/useAuth";
import { useUser } from "../../../hooks/useUser";

import { pickImage } from "../../../utils/pickImage";
import { uploadImageToCloudinary } from "../../../lib/upload";
import { updateUserProfile } from "../../../lib/firebase/firestore";
import { changePassword } from "../../../lib/firebase/auth";

export default function EditProfileScreen() {
  const { user } = useAuth();
  const { profile } = useUser(user);

  const [fullName, setFullName] = useState(profile?.fullName || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [avatar, setAvatar] = useState<string | null>(profile?.avatar || null);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePickAvatar = async () => {
    const uri = await pickImage();
    if (uri) setAvatar(uri);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      let avatarUrl = profile.avatar;

      if (avatar && avatar !== profile.avatar) {
        avatarUrl = await uploadImageToCloudinary(avatar);
      }

      await updateUserProfile(user!.uid, {
        fullName,
        phone,
        avatar: avatarUrl,
      });

      // Chỉ đổi mật khẩu cho email/password
      if (
        newPassword.length >= 6 &&
        user?.providerData[0]?.providerId === "password"
      ) {
        await changePassword(newPassword);
      }

      alert("Cập nhật thành công");
      router.back();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 pt-6">
      <TouchableOpacity
        onPress={handlePickAvatar}
        className="items-center mb-6"
      >
        <Image
          source={{
            uri: profile?.avatar
              ? profile.avatar
              : `https://ui-avatars.com/api/?name=${fullName}&background=8b5cf6&color=fff`,
          }}
          className="w-28 h-28 rounded-full"
        />
        <Text className="text-violet-600 mt-2">Đổi ảnh đại diện</Text>
      </TouchableOpacity>

      <Input label="Họ và tên" value={fullName} onChangeText={setFullName} />
      <Input label="Số điện thoại" value={phone} onChangeText={setPhone} />

      <Text className="text-lg font-bold mt-6 mb-3">Đổi mật khẩu</Text>
      <Input
        label="Mật khẩu mới"
        placeholder="Bỏ trống nếu không đổi"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <Button title="Lưu thay đổi" onPress={handleSave} loading={loading} />
    </View>
  );
}
