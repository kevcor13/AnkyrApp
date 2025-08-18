import {View, Text, Image, TouchableOpacity, ActivityIndicator, Alert} from 'react-native';
import images from "@/constants/images";
import icons from "@/constants/icons";
import React, {useState} from 'react';
import {useGlobal} from "@/context/GlobalProvider";
import {router} from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const HomeSettings = () => {
  const {userData, logoutUser, setUserData, ngrokAPI} = useGlobal();
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);

  const handlePickImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission needed', 'You need to give permission to access your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      await updateProfileImage(result.assets[0].uri, result.assets[0].mimeType);
    }
  };

  // --- minimal change: upload file as multipart, expect backend to return a public https URL
  const updateProfileImage = async (imageUri: string, mimeType?: string) => {
    try {
      setIsUpdatingImage(true);

      const extFromMime =
        mimeType?.split('/')[1] ||
        (imageUri.split('.').pop() || 'jpg');
      const safeExt = extFromMime.toLowerCase() === 'jpg' ? 'jpeg' : extFromMime.toLowerCase();
      const type = mimeType || `image/${safeExt}`;
      const fileName = `avatar.${safeExt}`;

      const form = new FormData();
      form.append('userId', userData._id);
      // important: send the actual binary file, not the file:// string
      form.append('image', {
        uri: imageUri,
        name: fileName,
        type,
      } as any);

      // keep same endpoint to avoid big changes; backend should accept multipart and return {status:'success', url: 'https://...'} (or updatedUser)
      const res = await axios.post(`${ngrokAPI}/api/user/updateProfile`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.status === 'success') {
        const newUrl: string | undefined = res.data?.url || res.data?.updatedUser?.profileImage;

        if (newUrl && /^https?:\/\//i.test(newUrl)) {
          setUserData(res.data?.updatedUser ?? { ...userData, profileImage: newUrl });
          Alert.alert('Success', 'Profile picture updated');
        } else {
          setUserData(res.data?.updatedUser ?? { ...userData });
          Alert.alert(
            'Update saved',
            'Image uploaded, but the server did not return a public URL. Make sure your backend stores an HTTPS URL.'
          );
        }
      } else {
        throw new Error(res.data?.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Error updating profile image:', err);
      Alert.alert('Error', 'Failed to update profile picture');
    } finally {
      setIsUpdatingImage(false);
    }
  };

  const handleEdit = () => handlePickImage();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  if (showLogoutConfirmation) {
    return (
      <View className="flex-1 bg-black">
        <View className="mt-16 px-6">
          <TouchableOpacity onPress={() => !isLoggingOut && setShowLogoutConfirmation(false)} disabled={isLoggingOut}>
            <Text className="text-white font-poppins-semibold text-[18px]">Back</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-white font-poppins-semibold text-[30px] text-center">
            Are you sure you want to log out?
          </Text>

          <TouchableOpacity onPress={handleLogout} disabled={isLoggingOut} className="bg-[#D7E9E7] w-full py-4 rounded-lg mt-12">
            {isLoggingOut ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <Text className="text-black text-center font-poppins-semibold text-[18px]">Log out</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const avatarUri =
    userData?.profileImage && /^https?:\/\//i.test(userData.profileImage)
      ? userData.profileImage
      : undefined;

  return (
    <View className="bg-black h-full px-6">
      <View className="mt-16">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-white font-poppins-semibold text-[18px]">Back</Text>
        </TouchableOpacity>
      </View>

      <View className="mt-10 flex-row">
        <Text className="flex-1 text-white font-poppins-semibold text-[25px]">Profile</Text>
        <Image source={images.profile} className="w-[49] h-[29]" />
      </View>

      <View className="mt-8">
        <Text className="text-white font-poppins-semibold text-[19px]">Edit your profile picture: </Text>

        <View className="mt-8 flex-row items-center">
          {isUpdatingImage ? (
            <ActivityIndicator size="large" color="#D7E9E7" />
          ) : (
            <Image
              source={avatarUri ? { uri: avatarUri } : images.profile}
              className="w-40 h-40 rounded-full"
              onError={() => console.log('avatar failed to load')}
            />
          )}

          <TouchableOpacity onPress={handleEdit} className="ml-3">
            <Image source={icons.editProfile} className="w-6 h-6" />
          </TouchableOpacity>
        </View>

        <View className="mt-10">
          <Text className="text-white font-poppins-medium text-[19px]">Username:</Text>
          <Text className="text-white font-poppins-semibold text-[27px]">{userData?.username || "User"}</Text>
        </View>
      </View>

      <View className="mt-20">
        <Text className="text-white font-poppins-semibold text-[24px]">App settings</Text>

        <TouchableOpacity className="mt-10 flex-row" onPress={() => router.push("/settings")}>
          <Text className="text-white flex-1 font-poppins-semibold text-[19px]">Settings</Text>
          <Image source={icons.settingArrow} />
        </TouchableOpacity>

        <TouchableOpacity className="mt-10 flex-row" onPress={() => setShowLogoutConfirmation(true)} disabled={isLoggingOut}>
          <Text className="text-white flex-1 font-poppins-semibold text-[19px]">log out</Text>
          <Image source={icons.logOut} className="w-8 h-8" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeSettings;
