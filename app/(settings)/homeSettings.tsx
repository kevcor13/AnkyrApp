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
        // Request permission to access camera roll
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Permission needed', 'You need to give permission to access your photos');
            return;
        }

        // Launch image picker
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled && result.assets && result.assets[0]) {
            // Upload image to server
            await updateProfileImage(result.assets[0].uri);
        }
    };

    const updateProfileImage = async (imageUri) => {
        try {
            setIsUpdatingImage(true);
            console.log(imageUri);

            // Create form data for image upload
            const profileImage = imageUri;
            const userId = userData._id;

            // Send to server
            const response = await axios.post(`${ngrokAPI}/updateProfileImage`, {userId, profileImage});

            if (response.data.status === 'success') {
                // Update local user data with new image
                Alert.alert('Success', 'Profile picture updated');

                // Update the user data in the context with the new profile image
                // This will cause a refresh throughout the app
                if (response.data.updatedUser) {
                    setUserData(response.data.updatedUser);
                } else {
                    // If the response doesn't include updated user data, manually update just the image
                    setUserData({
                        ...userData,
                        profileImage: imageUri
                    });
                }
            }
        } catch (error) {
            console.error('Error updating profile image:', error);
            Alert.alert('Error', 'Failed to update profile picture');
        } finally {
            setIsUpdatingImage(false);
        }
    };

    const handleEdit = () => {
        handlePickImage();
    };

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await logoutUser();
        } catch (error) {
            console.error("Logout error:", error);
            setIsLoggingOut(false);
        }
    };

    // Conditional rendering for logout confirmation screen
    if (showLogoutConfirmation) {
        return (
            <View className="flex-1 bg-black">
                <View className="mt-16 px-6">
                    <TouchableOpacity
                        onPress={() => {
                            if (!isLoggingOut) {
                                setShowLogoutConfirmation(false);
                            }
                        }}
                        disabled={isLoggingOut}
                    >
                        <Text className="text-white font-poppins-semibold text-[18px]">Back</Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-1 justify-center items-center px-6">
                    <Text className="text-white font-poppins-semibold text-[30px] text-center">
                        Are you sure you want to log out?
                    </Text>

                    <TouchableOpacity
                        onPress={handleLogout}
                        disabled={isLoggingOut}
                        className="bg-[#D7E9E7] w-full py-4 rounded-lg mt-12"
                    >
                        {isLoggingOut ? (
                            <ActivityIndicator size="small" color="#000000" />
                        ) : (
                            <Text className="text-black text-center font-poppins-semibold text-[18px]">
                                Log out
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Main profile screen
    return (
        <View className="bg-black h-full px-6">
            <View className="mt-16">
                <TouchableOpacity onPress={() => router.push("/profile")}>
                    <Text className="text-white font-poppins-semibold text-[18px]">Back</Text>
                </TouchableOpacity>
            </View>
            <View className="mt-10 flex-row">
                <Text className="flex-1 text-white font-poppins-semibold text-[25px]">Profile</Text>
                <Image
                    source={images.profile}
                    className="w-[49] h-[29]"
                />
            </View>
            <View className="mt-8">
                <Text className="text-white font-poppins-semibold text-[19px]">Edit your profile picture: </Text>
                <View className="mt-8 flex-row items-center">
                    {isUpdatingImage ? (
                        <ActivityIndicator size="large" color="#D7E9E7" />
                    ) : (
                        <Image
                            source={userData?.profileImage ? { uri: userData.profileImage } : images.profile}
                            className="w-40 h-40 rounded-full"
                        />
                    )}
                    <TouchableOpacity onPress={handleEdit} className="ml-3">
                        <Image source={icons.editProfile} className="w-6 h-6"/>
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
                    <Text className="text-white flex-1 font-poppins-semibold text-[19px]">
                        Settings
                    </Text>
                    <Image source={icons.settingArrow}/>
                </TouchableOpacity>
                <TouchableOpacity
                    className="mt-10 flex-row"
                    onPress={() => setShowLogoutConfirmation(true)}
                    disabled={isLoggingOut}
                >
                    <Text className="text-white flex-1 font-poppins-semibold text-[19px]">
                        log out
                    </Text>
                    <Image source={icons.logOut} className="w-8 h-8" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default HomeSettings;