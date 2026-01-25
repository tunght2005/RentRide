import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firebaseApp } from "./config";

const storage = getStorage(firebaseApp);

export async function uploadAvatar(uid: string, uri: string) {
  const response = await fetch(uri);
  const blob = await response.blob();

  const avatarRef = ref(storage, `avatars/${uid}.jpg`);
  await uploadBytes(avatarRef, blob);

  return await getDownloadURL(avatarRef);
}
